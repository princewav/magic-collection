import { Deck } from '@/types/deck';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

export class DeckService extends BaseService<Deck> {
  public repo = new RepoCls<Deck>(DB, 'decks');

  async findAll(): Promise<Deck[]> {
    try {
      return await this.repo.getAll();
    } catch (error) {
      console.error('Error finding all decks:', error);
      throw error;
    }
  }

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
}
export const deckService = new DeckService();
