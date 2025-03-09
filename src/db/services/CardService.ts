import { Card } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');

  async getByNameAndSet(name: string, set: string) {
    return this.repo.findBy({ name, set });
  }
}

export const cardService = new CardService();
