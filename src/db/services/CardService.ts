import { Card } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { Document } from 'mongodb';
import { CardFilteringService } from './CardFilteringService';

interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  sets?: string[];
  exactColorMatch?: boolean;
}

const DEDUPLICATION_FETCH_MULTIPLIER = 3;

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');
  private filteringService: CardFilteringService;

  constructor(filteringService: CardFilteringService) {
    super();
    this.filteringService = filteringService;
  }

  async getByNameAndSet(name: string, set: string, setNumber: string = '') {
    if (!name) {
      return [];
    }

    const searchStrategies = [
      { name, exact: true, includeSetNumber: true },
      { name, exact: false, includeSetNumber: true },
      { name, exact: true, includeSetNumber: false },
      { name, exact: false, includeSetNumber: false },
    ];

    const normalizedSet = set.toLowerCase();

    for (const strategy of searchStrategies) {
      const query = {
        name: strategy.exact ? name : new RegExp(name, 'i'),
        ...(set ? { set: normalizedSet } : {}),
        ...(strategy.includeSetNumber && setNumber
          ? { collector_number: setNumber }
          : {}),
      };

      const resultsDocs = await this.repo.findBy(query);
      if (resultsDocs.length > 0) {
        return resultsDocs;
      }
    }

    return [];
  }

  async getByName(name: string) {
    const exactMatchDocs = await this.repo.findBy({ name });
    if (exactMatchDocs.length > 0) {
      return exactMatchDocs;
    }
    const fuzzyMatchDocs = await this.repo.findBy({
      name: new RegExp(name, 'i'),
    });
    return fuzzyMatchDocs;
  }

  async getByCardId(ids: string[]): Promise<Card[] | null> {
    // Use aggregation to ensure only one document per cardId is returned
    const pipeline = [
      {
        $match: {
          cardId: { $in: ids },
        },
      },
      {
        $sort: { released_at: -1 }, // Optional: Sort to prefer newer printings if duplicates exist
      },
      {
        $group: {
          _id: '$cardId', // Group by the unique cardId
          firstDoc: { $first: '$$ROOT' }, // Take the first document found for each group
        },
      },
      {
        $replaceRoot: { newRoot: '$firstDoc' }, // Promote the selected document to the root level
      },
    ];

    const docs = await this.repo.collection.aggregate(pipeline).toArray();

    // Map _id back to id if necessary (depending on BaseService/RepoCls implementation)
    const cards = docs.map(({ _id, ...doc }) => ({
      ...doc,
      id: _id?.toString(), // Handle potential ObjectId _id from aggregation
    })) as Card[];

    return cards;
  }

  async getCardsByNames(names: string[]): Promise<Card[]> {
    if (!names || names.length === 0) {
      return [];
    }

    // Use aggregation to fetch one document per name, preferring newer printings.
    const pipeline = [
      {
        $match: {
          name: { $in: names },
        },
      },
      // Add a field to handle null prices for sorting. Assign a large number if price is null.
      {
        $addFields: {
          priceValue: {
            $ifNull: [{ $toDouble: '$prices.eur' }, Number.MAX_SAFE_INTEGER],
          },
        },
      },
      // Sort by name (for grouping consistency) and then by price ascending.
      // Documents with null prices (now MAX_SAFE_INTEGER) will be sorted last.
      {
        $sort: {
          name: 1,
          priceValue: 1,
        },
      },
      // Group by card name and take the first document encountered,
      // which will have the lowest price due to the preceding sort.
      {
        $group: {
          _id: '$name',
          firstDoc: { $first: '$$ROOT' },
        },
      },
      // Promote the selected document to the root.
      {
        $replaceRoot: { newRoot: '$firstDoc' },
      },
      // Remove the temporary sorting field.
      {
        $project: {
          priceValue: 0,
        },
      },
    ];

    const docs = await this.repo.collection.aggregate(pipeline).toArray();

    // Map MongoDB _id to string id if necessary
    const cards = docs.map(({ _id, ...doc }) => ({
      ...doc,
      id: doc.id || _id?.toString(), // Prefer existing doc.id, fallback to aggregation _id
    })) as Card[];

    return cards;
  }

  async getFilteredCards(
    filters: FilterOptions,
    deduplicate: boolean = true,
  ): Promise<Card[]> {
    const pipeline = this.filteringService.buildAggregationPipeline(
      filters,
      deduplicate,
    );

    let docs = await this.repo.collection.aggregate(pipeline).toArray();
    const cards = docs.map(({ _id, ...doc }) => ({
      ...doc,
      id: _id.toString(),
    })) as Card[];

    return cards;
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 50,
    deduplicate: boolean = true,
  ): Promise<{ cards: Card[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const pipeline = this.filteringService.buildAggregationPipeline(
      filters,
      deduplicate,
    );

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const fetchDocsPromise = this.repo.collection.aggregate(pipeline).toArray();

    let totalCountPromise: Promise<number>;

    if (deduplicate) {
      const countPipeline = this.filteringService.buildCountPipeline(
        filters,
        true,
      );
      totalCountPromise = this.repo.collection
        .aggregate(countPipeline)
        .toArray()
        .then((result) => result[0]?.total ?? 0);
    } else {
      const filterQuery = this.filteringService.buildFilterQuery(filters);
      totalCountPromise = this.repo.collection.countDocuments(filterQuery);
    }

    const [docs, totalCountResult] = await Promise.all([
      fetchDocsPromise,
      totalCountPromise,
    ]);

    const docsWithIds = docs.map(({ _id, ...doc }) => ({
      ...doc,
      id: _id.toString(),
    })) as Card[];

    return { cards: docsWithIds, total: totalCountResult };
  }
}

const cardFilteringService = new CardFilteringService();

export const cardService = new CardService(cardFilteringService);
