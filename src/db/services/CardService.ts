import { Card, CollectionCard } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');

  async getByNameAndSet(name: string, set: string, setNumber: string = '') {
    if (!name || !set) {
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
        set: normalizedSet,
        ...(strategy.includeSetNumber && setNumber ? { collector_number: setNumber } : {}),
      };

      const results = await this.repo.findBy(query);
      if (results.length > 0) {
        return results;
      }
    }

    // If we reach here, no results were found with any strategy
    return [];
  }

  async getByName(name: string) {
    const exactMatch = await this.repo.findBy({ name });
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    return this.repo.findBy({ name: new RegExp(name, 'i') });
  }
}

export class CollectionCardService extends BaseService<CollectionCard> {
  public repo = new RepoCls<CollectionCard>(DB, 'collection-cards');

  async getByType(type: 'paper' | 'arena') {
    return this.repo.findBy({ collectionType: type });
  }
}

export const cardService = new CardService();
export const collectionCardService = new CollectionCardService();
