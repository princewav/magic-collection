import { Card, CollectionCard } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
}

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

    // Create sort object for MongoDB
    const sortOptions: Record<string, 1 | -1> = {};
    if (filters.sortFields && filters.sortFields.length > 0) {
      filters.sortFields.forEach(({ field, order }) => {
        sortOptions[field] = order === 'asc' ? 1 : -1;
      });
    }

    const cursor = this.repo.collection.find(query);
    if (Object.keys(sortOptions).length > 0) {
      cursor.sort(sortOptions);
    }

    const docs = await cursor.toArray();
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

    // Create sort object for MongoDB
    const sortOptions: Record<string, 1 | -1> = {};
    if (filters.sortFields && filters.sortFields.length > 0) {
      filters.sortFields.forEach(({ field, order }) => {
        sortOptions[field] = order === 'asc' ? 1 : -1;
      });
    }

    const skip = (page - 1) * pageSize;

    // Execute queries in parallel
    const [total, docs] = await Promise.all([
      this.repo.collection.countDocuments(query),
      this.repo.collection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .toArray(),
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
