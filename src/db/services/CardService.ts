import { Card, CollectionCard } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { Document } from 'mongodb';

interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  sets?: string[];
}

const rarityOrder = [
  'bonus',
  'common',
  'uncommon',
  'rare',
  'mythic',
  'special',
];

const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');

  async getByNameAndSet(name: string, set: string, setNumber: string = '') {
    if (!name) {
      return [];
    }

    // Define search strategies in order of specificity
    const searchStrategies = [
      // 1. Exact name + set + setNumber (if provided)
      { name, exact: true, includeSetNumber: true },
      // 2. Fuzzy name + set + setNumber (if provided)
      { name, exact: false, includeSetNumber: true },
      // 3. Exact name + set (without setNumber)
      { name, exact: true, includeSetNumber: false },
      // 4. Fuzzy name + set (without setNumber)
      { name, exact: false, includeSetNumber: false },
    ];

    const normalizedSet = set.toLowerCase();

    // Try each strategy until we find results
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

    // If we reach here, no results were found with any strategy
    return [];
  }

  async getAll(limit: number): Promise<Card[]> {
    const cursor = this.repo.collection.find().limit(limit);
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];
  }

  async getByName(name: string) {
    const exactMatch = await this.repo.findBy({ name });
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    return this.repo.findBy({ name: new RegExp(name, 'i') });
  }

  async getByCardId(ids: string[]): Promise<Card[] | null> {
    const cursor = this.repo.collection.find({ cardId: { $in: ids } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];
  }

  async getFilteredCards(filters: FilterOptions): Promise<Card[]> {
    const query: Record<string, any> = {};

    // Apply filters
    this.applyFilters(query, filters);

    const needsCustomSorting = this.needsCustomSorting(filters);
    const sortStage = this.buildSortStage(filters);

    let pipeline = [];

    if (needsCustomSorting) {
      // Use aggregation with custom sort fields
      pipeline = [
        { $match: query },
        ...this.buildCustomSortStages(filters),
        { $sort: sortStage },
        // Project out temporary fields
        {
          $project: {
            _rarityIndex: 0,
            _colorIndex: 0,
            _colorCategory: 0,
            _colorsArray: 0,
          },
        },
      ];
    } else {
      // Use simple find with standard sort
      pipeline = [{ $match: query }, { $sort: sortStage }];
    }

    const docs = await this.repo.collection.aggregate(pipeline).toArray();

    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ cards: Card[]; total: number }> {
    const query: Record<string, any> = {};

    // Apply filters
    this.applyFilters(query, filters);

    const skip = (page - 1) * pageSize;
    const needsCustomSorting = this.needsCustomSorting(filters);
    const sortStage = this.buildSortStage(filters);

    let pipeline = [];

    if (needsCustomSorting) {
      // Use aggregation with custom sort fields
      pipeline = [
        { $match: query },
        ...this.buildCustomSortStages(filters),
        { $sort: sortStage },
        // Project out temporary fields
        {
          $project: {
            _rarityIndex: 0,
            _colorIndex: 0,
            _colorCategory: 0,
            _colorsArray: 0,
          },
        },
        { $skip: skip },
        { $limit: pageSize },
      ];
    } else {
      // Use simple find with standard sort
      pipeline = [
        { $match: query },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: pageSize },
      ];
    }

    // Execute queries in parallel
    const [total, docs] = await Promise.all([
      this.repo.collection.countDocuments(query),
      this.repo.collection.aggregate(pipeline).toArray(),
    ]);

    const cards = docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];

    return {
      cards,
      total,
    };
  }

  // Helper method to apply filters
  private applyFilters(
    query: Record<string, any>,
    filters: FilterOptions,
  ): void {
    // Apply color filter
    if (filters.colors && filters.colors.length > 0) {
      query.colors = { $in: filters.colors };
    }

    // Apply CMC range filter
    if (filters.cmcRange) {
      const [min, max] = filters.cmcRange;
      query.cmc = { $gte: min, $lte: max };
    }

    // Apply rarity filter
    if (filters.rarities && filters.rarities.length > 0) {
      query.rarity = { $in: filters.rarities };
    }

    // Apply set filter
    if (filters.sets && filters.sets.length > 0) {
      query.set = { $in: filters.sets.map((set) => set.toLowerCase()) };
    }
  }

  // Helper to check if custom sorting is needed
  private needsCustomSorting(filters: FilterOptions): boolean {
    return (
      filters.sortFields?.some(
        (f) => f.field === 'colors' || f.field === 'rarity',
      ) ?? false
    );
  }

  // Helper to build the custom sort stages
  private buildCustomSortStages(filters: FilterOptions): Document[] {
    const stages: Document[] = [];

    // Add field for rarity order if needed
    if (filters.sortFields?.some((f) => f.field === 'rarity')) {
      stages.push({
        $addFields: {
          _rarityIndex: {
            $indexOfArray: [rarityOrder, '$rarity'],
          },
        },
      });
    }

    // Add field for color order if needed
    if (filters.sortFields?.some((f) => f.field === 'colors')) {
      // First add a field to ensure colors is an array
      stages.push({
        $addFields: {
          _colorsArray: {
            $cond: {
              if: { $eq: [{ $type: '$colors' }, 'array'] },
              then: '$colors',
              else: [],
            },
          },
        },
      });

      // Now add the color category
      stages.push({
        $addFields: {
          _colorCategory: {
            $cond: {
              if: { $eq: [{ $size: '$_colorsArray' }, 0] },
              then: 'C',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$_colorsArray' }, 1] },
                  then: 'M',
                  else: { $arrayElemAt: ['$_colorsArray', 0] },
                },
              },
            },
          },
        },
      });

      // Now add the index based on the category
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

  // Helper to build sort stage
  private buildSortStage(filters: FilterOptions): Record<string, 1 | -1> {
    const sortStage: Record<string, 1 | -1> = {};

    if (filters.sortFields && filters.sortFields.length > 0) {
      for (const { field, order } of filters.sortFields) {
        const sortDirection = order === 'asc' ? 1 : -1;

        if (field === 'rarity') {
          sortStage._rarityIndex = sortDirection;
        } else if (field === 'colors') {
          sortStage._colorIndex = sortDirection;
        } else {
          sortStage[field] = sortDirection;
        }
      }
    }

    // Always add name as secondary sort criteria
    if (!sortStage.name) {
      sortStage.name = 1;
    }

    return sortStage;
  }
}

export class CollectionCardService extends BaseService<CollectionCard> {
  public repo = new RepoCls<CollectionCard>(DB, 'collection-cards');

  async getByType(type: 'paper' | 'arena') {
    return this.repo.findBy({ collectionType: type });
  }

  async getByCardId(ids: string[]): Promise<CollectionCard[] | null> {
    const cursor = this.repo.collection.find({ cardId: { $in: ids } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }
  async getByCardNames(names: string[]): Promise<CollectionCard[] | null> {
    const cursor = this.repo.collection.find({ name: { $in: names } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }
}

export const cardService = new CardService();
export const collectionCardService = new CollectionCardService();
