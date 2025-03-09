import { Card } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { Filter } from 'mongodb';

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');

  async getByNameAndSet(name: string, set: string) {
    const exactMatch = await this.repo.findBy({ name, set: set.toLowerCase() });
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    return this.repo.findBy({ name: new RegExp(name, 'i'), set: set.toLowerCase() });
  }

  async getByName(name: string) {
    const exactMatch = await this.repo.findBy({ name });
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    return this.repo.findBy({ name: new RegExp(name, 'i') });
  }
}

export const cardService = new CardService();
