import { CouchDbRepository } from './CouchDbRepository';
import { Deck } from '../types/deck';

export class DeckRepository extends CouchDbRepository<Deck> {
  constructor() {
    super('decks');
  }

  async deleteMany(ids: string[]) {
    try {
      const response = await this.find({
        selector: {
          _id: { $in: ids },
          type: 'deck',
        },
      });

      await Promise.all(
        response.docs.map(async (deck) => {
          await this.remove(deck);
        }),
      );
      return true;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to delete decks');
    }
  }

  async duplicateMany(ids: string[]) {
    try {
      const response = await this.find({
        selector: {
          _id: { $in: ids },
          type: 'deck',
        },
      });

      const duplicatedDecks = response.docs.map((deck) => ({
        ...deck,
        _id: `deck_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        _rev: undefined,
        name: `${deck.name} (Copy)`,
      }));

      await Promise.all(duplicatedDecks.map((deck) => this.put(deck)));
      return duplicatedDecks;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to duplicate decks');
    }
  }

  async findAll() {
    try {
      const response = await this.find({
        selector: {
          type: 'deck',
        },
      });
      return response.docs;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to load decks');
    }
  }

  async findById(id: string) {
    try {
      const deck = await this.findById(id);
      if (deck.type !== 'deck') {
        throw new Error('Deck not found');
      }
      return deck;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to load deck');
    }
  }
}

export const deckRepository = new DeckRepository();
