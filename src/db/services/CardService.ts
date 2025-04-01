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
    const docs = await this.repo.findBy({ cardId: { $in: ids } });
    return docs;
  }

  async getFilteredCards(
    filters: FilterOptions,
    deduplicate: boolean = true,
  ): Promise<Card[]> {
    const pipeline = this._filteringService.buildAggregationPipeline(filters);

    let docs = (await this.repo.collection.aggregate(pipeline).toArray());
    const cards = docs.map(({ _id, ...doc }) => ({ ...doc, id: _id.toString() })) as Card[];

    if (deduplicate) {
      return this._deduplicationService.deduplicateCardsByName(cards);
    }
    return cards;
  }

  /**
   * Fetches card documents and total count based on filters and pagination settings.
   */
  private async _fetchPaginatedCardData(
    filters: FilterOptions,
    skip: number,
    limit: number,
  ): Promise<{ docs: Document[]; totalCount: number }> {
    const filterQuery = this._filteringService.buildFilterQuery(filters);
    const pipeline = this._filteringService.buildAggregationPipeline(filters);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const [totalCountResult, docs] = await Promise.all([
      this.repo.collection.countDocuments(filterQuery),
      this.repo.collection.aggregate(pipeline).toArray(),
    ]);
    const docsWithIds = docs.map(({ _id, ...doc }) => ({ ...doc, id: _id.toString() }));

    return { docs: docsWithIds, totalCount: totalCountResult };
  }

  /**
   * Handles deduplication and adjusts the total count based on deduplication results.
   */
  private _processDeduplicationAndTotal(
    cards: Card[],
    totalCount: number,
    page: number,
    pageSize: number,
    fetchedLimit: number, // The limit used in the DB query
  ): { cards: Card[]; total: number } {
    const originalLength = cards.length;
    let deduplicatedCards =
      this._deduplicationService.deduplicateCardsByName(cards);
    deduplicatedCards = deduplicatedCards.slice(0, pageSize); // Trim to page size after deduplication

    let adjustedTotal = totalCount;

    // Adjust total count estimate only on the first page when deduplication significantly reduces results
    if (page === 1 && originalLength > 0 && deduplicatedCards.length > 0) {
      // Check if we fetched extra items for deduplication
      if (fetchedLimit > pageSize) {
        // Avoid division by zero
        const deduplicationRatio = deduplicatedCards.length / originalLength;
        // Estimate total based on the ratio, ensuring it's at least the number of cards on the current page
        adjustedTotal = Math.max(
          Math.ceil(totalCount * deduplicationRatio),
          deduplicatedCards.length,
        );
      } else {
        // If we didn't fetch extra (limit == pageSize), the total is just the count on this page
        adjustedTotal = deduplicatedCards.length;
      }
    } else if (page > 1) {
      // For subsequent pages, use the original total count as estimation is less reliable
      adjustedTotal = totalCount;
    } else if (page === 1 && deduplicatedCards.length === 0) {
      // If the first page is empty after deduplication, the total is 0
      adjustedTotal = 0;
    }
    // If totalCount was 0 initially, adjustedTotal remains 0

    return { cards: deduplicatedCards, total: adjustedTotal };
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 50,
    deduplicate: boolean = true,
  ): Promise<{ cards: Card[]; total: number }> {
    const skip = (page - 1) * pageSize;
    // Fetch more items if deduplicating to increase chances of filling the page
    const limit = pageSize * (deduplicate ? DEDUPLICATION_FETCH_MULTIPLIER : 1);

    const { docs, totalCount } = await this._fetchPaginatedCardData(
      filters,
      skip,
      limit,
    );

    let cards = docs as Card[];

    if (!deduplicate) {
      // If not deduplicating, trim results to pageSize (if limit was > pageSize)
      // and return the accurate total count from the database.
      cards = cards.slice(0, pageSize);
      return { cards, total: totalCount };
    }

    // Handle deduplication and total count adjustment
    return this._processDeduplicationAndTotal(
      cards,
      totalCount,
      page,
      pageSize,
      limit,
    );
  }
}

const cardDeduplicationService = new CardDeduplicationService();
const cardFilteringService = new CardFilteringService();

export const cardService = new CardService(
  cardDeduplicationService,
  cardFilteringService,
);
