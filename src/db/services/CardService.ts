import { Card } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { Document } from 'mongodb';
import { CardDeduplicationService } from './deduplication';
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
  private _deduplicationService: CardDeduplicationService;
  private _filteringService: CardFilteringService;

  constructor(
    deduplicationService: CardDeduplicationService,
    filteringService: CardFilteringService,
  ) {
    super();
    this._deduplicationService = deduplicationService;
    this._filteringService = filteringService;
  }

  private _mapDocsToCards(docs: Document[]): Card[] {
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];
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
      const results = this._mapDocsToCards(resultsDocs as Document[]);
      if (results.length > 0) {
        return results;
      }
    }

    return [];
  }

  async getByName(name: string) {
    const exactMatchDocs = await this.repo.findBy({ name });
    if (exactMatchDocs.length > 0) {
      return this._mapDocsToCards(exactMatchDocs as Document[]);
    }
    const fuzzyMatchDocs = await this.repo.findBy({
      name: new RegExp(name, 'i'),
    });
    return this._mapDocsToCards(fuzzyMatchDocs as Document[]);
  }

  async getByCardId(ids: string[]): Promise<Card[] | null> {
    const docs = await this.repo.findBy({ cardId: { $in: ids } });
    return this._mapDocsToCards(docs as Document[]);
  }

  async getFilteredCards(
    filters: FilterOptions,
    deduplicate: boolean = true,
  ): Promise<Card[]> {
    const pipeline = this._filteringService.buildAggregationPipeline(filters);

    const docs = await this.repo.collection.aggregate(pipeline).toArray();

    let cards = this._mapDocsToCards(docs);

    if (deduplicate) {
      cards = this._deduplicationService.deduplicateCardsByName(cards);
    }

    return cards;
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 50,
    deduplicate: boolean = true,
  ): Promise<{ cards: Card[]; total: number }> {
    const filterQuery = this._filteringService.buildFilterQuery(filters);

    const skip = (page - 1) * pageSize;
    const limit = pageSize * (deduplicate ? DEDUPLICATION_FETCH_MULTIPLIER : 1);

    const pipeline = this._filteringService.buildAggregationPipeline(filters);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const [totalCountResult, docs] = await Promise.all([
      this.repo.collection.countDocuments(filterQuery),
      this.repo.collection.aggregate(pipeline).toArray(),
    ]);

    let cards = this._mapDocsToCards(docs);
    let total = totalCountResult;

    if (!deduplicate) return { cards, total };

    const originalLength = cards.length;
    cards = this._deduplicationService.deduplicateCardsByName(cards);
    cards = cards.slice(0, pageSize);

    if (page === 1 && originalLength > 0 && cards.length > 0) {
      if (limit > pageSize) {
        const deduplicationRatio = cards.length / originalLength;
        total = Math.max(
          Math.ceil(totalCountResult * deduplicationRatio),
          cards.length,
        );
      } else {
        total = cards.length;
      }
    } else if (page > 1) {
      total = totalCountResult;
    } else if (page === 1 && cards.length === 0) {
      total = 0;
    }

    return {
      cards,
      total,
    };
  }
}

const cardDeduplicationService = new CardDeduplicationService();
const cardFilteringService = new CardFilteringService();

export const cardService = new CardService(
  cardDeduplicationService,
  cardFilteringService,
);
