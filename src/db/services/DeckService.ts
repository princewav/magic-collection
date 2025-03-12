import { Deck } from '@/types/deck';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

export class DeckService extends BaseService<Deck> {
  public repo = new RepoCls<Deck>(DB, 'decks');

  async duplicateMany(ids: string[]) {
    try {
      const response = (await this.repo.get(ids)) || [];

      const duplicated = response.map((doc) => ({
        ...doc,
        name: `${doc.name} (Copy)`,
      }));

      await Promise.all(duplicated.map((deck) => this.repo.create(deck)));
      return duplicated;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to duplicate decks');
    }
  }

  async findByType(type: 'paper' | 'arena') {
    try {
      return await this.repo.findBy({ type });
    } catch (e) {
      console.error(e);
      throw new Error('Failed to get decks');
    }
  }
}

export const deckService = new DeckService();
