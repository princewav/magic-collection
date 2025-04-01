import { Card } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { Document } from 'mongodb';
import { Rarity, Layout } from '@/types/card';
import { CardDeduplicationService } from './deduplication';

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

const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];
const DEDUPLICATION_FETCH_MULTIPLIER = 3;

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');
  private deduplicationService: CardDeduplicationService;

  constructor(deduplicationService: CardDeduplicationService) {
    super();
    this.deduplicationService = deduplicationService;
  }

  private _mapDocsToCards(docs: Document[]): Card[] {
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];
  }

  private _applyFilters(
    query: Record<string, any>,
    filters: FilterOptions,
  ): void {
    if (filters.colors && filters.colors.length > 0) {
      if (filters.exactColorMatch) {
        query.$and = [
          { colors: { $all: filters.colors } },
          { colors: { $size: filters.colors.length } },
        ];
      } else {
        query.colors = { $in: filters.colors };
      }
    }

    if (filters.cmcRange) {
      const [min, max] = filters.cmcRange;
      query.cmc = { $gte: min, $lte: max };
    }

    if (filters.rarities && filters.rarities.length > 0) {
      query.rarity = { $in: filters.rarities };
    }

    if (filters.sets && filters.sets.length > 0) {
      query.set = { $in: filters.sets.map((set) => set.toLowerCase()) };
    }
  }

  private _needsCustomSorting(filters: FilterOptions): boolean {
    return (
      filters.sortFields?.some(
        (f) => f.field === 'colors' || f.field === 'rarity',
      ) ?? false
    );
  }

  private _buildCustomSortStages(filters: FilterOptions): Document[] {
    const stages: Document[] = [];

    if (filters.sortFields?.some((f) => f.field === 'rarity')) {
      stages.push({
        $addFields: {
          _rarityIndex: {
            $indexOfArray: [Object.values(Rarity), '$rarity'],
          },
        },
      });
    }

    if (filters.sortFields?.some((f) => f.field === 'colors')) {
      stages.push({
        $addFields: {
          _colorsArray: {
            $ifNull: ['$colors', []],
          },
        },
      });
      stages.push({
        $addFields: {
          _colorsArray: {
            $cond: {
              if: { $isArray: '$_colorsArray' },
              then: '$_colorsArray',
              else: [],
            },
          },
        },
      });

      stages.push({
        $addFields: {
          _colorCategory: {
            $switch: {
              branches: [
                { case: { $eq: [{ $size: '$_colorsArray' }, 0] }, then: 'C' },
                { case: { $gt: [{ $size: '$_colorsArray' }, 1] }, then: 'M' },
              ],
              default: { $arrayElemAt: ['$_colorsArray', 0] },
            },
          },
        },
      });

      stages.push({
        $addFields: {
          _colorIndex: {
            $indexOfArray: [colorOrder, '$_colorCategory'],
          },
        },
      });
    }

    return stages;
  }

  private _buildSortStage(filters: FilterOptions): Record<string, 1 | -1> {
    const sortStage: Record<string, 1 | -1> = {};

    if (filters.sortFields && filters.sortFields.length > 0) {
      for (const { field, order } of filters.sortFields) {
        const sortDirection = order === 'asc' ? 1 : -1;

        switch (field) {
          case 'rarity':
            sortStage._rarityIndex = sortDirection;
            break;
          case 'colors':
            sortStage._colorIndex = sortDirection;
            break;
          case 'cmc':
            sortStage.cmc = sortDirection;
            break;
          default:
            sortStage[field] = sortDirection;
            break;
        }
      }
    }

    if (
      !sortStage.name &&
      !filters.sortFields?.some((f) => f.field === 'name')
    ) {
      sortStage.name = 1;
    }

    if (!sortStage._id) {
      sortStage._id = 1;
    }

    return sortStage;
  }

  private _buildBaseAggregationPipeline(filters: FilterOptions): Document[] {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters);

    const needsCustomSort = this._needsCustomSorting(filters);
    const sortStage = this._buildSortStage(filters);

    let pipeline: Document[] = [];

    pipeline.push({ $match: query });

    if (needsCustomSort) {
      pipeline.push(...this._buildCustomSortStages(filters));
    }

    pipeline.push({ $sort: sortStage });

    if (needsCustomSort) {
      const projection: Document = { $project: {} };
      if (filters.sortFields?.some((f) => f.field === 'rarity')) {
        projection.$project._rarityIndex = 0;
      }
      if (filters.sortFields?.some((f) => f.field === 'colors')) {
        projection.$project._colorIndex = 0;
        projection.$project._colorCategory = 0;
        projection.$project._colorsArray = 0;
      }
      if (Object.keys(projection.$project).length > 0) {
        pipeline.push(projection);
      }
    }

    return pipeline;
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

      const results = await this.repo.findBy(query);
      if (results.length > 0) {
        return results;
      }
    }

    return [];
  }

  async getByName(name: string) {
    const exactMatch = await this.repo.findBy({ name });
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    return this.repo.findBy({ name: new RegExp(name, 'i') });
  }

  async getByCardId(ids: string[]): Promise<Card[] | null> {
    return this.repo.findBy({ cardId: { $in: ids } });
  }

  async getFilteredCards(
    filters: FilterOptions,
    deduplicate: boolean = true,
  ): Promise<Card[]> {
    const pipeline = this._buildBaseAggregationPipeline(filters);

    const docs = await this.repo.collection.aggregate(pipeline).toArray();

    let cards = this._mapDocsToCards(docs);

    if (deduplicate) {
      cards = this.deduplicationService.deduplicateCardsByName(cards);
    }

    return cards;
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 50,
    deduplicate: boolean = true,
  ): Promise<{ cards: Card[]; total: number }> {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters);

    const skip = (page - 1) * pageSize;
    const limit = pageSize * (deduplicate ? DEDUPLICATION_FETCH_MULTIPLIER : 1);

    const pipeline = this._buildBaseAggregationPipeline(filters);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const [totalCountResult, docs] = await Promise.all([
      this.repo.collection.countDocuments(query),
      this.repo.collection.aggregate(pipeline).toArray(),
    ]);

    let cards = this._mapDocsToCards(docs);
    let total = totalCountResult;

    if (!deduplicate) return { cards, total };

    const originalLength = cards.length;
    cards = this.deduplicationService.deduplicateCardsByName(cards);
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
    }

    return {
      cards,
      total,
    };
  }
}

const cardDeduplicationService = new CardDeduplicationService();
export const cardService = new CardService(cardDeduplicationService);
