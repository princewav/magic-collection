import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { DBDeck, DeckCard } from '@/types/deck';

export class DeckService extends BaseService<DBDeck> {
  public repo = new RepoCls<DBDeck>(DB, 'decks');

  async duplicateMany(userId: string, ids: string[]) {
    try {
      // Fetch the decks first
      const decks = (await this.repo.get(ids)) || [];

      // Ensure all fetched decks belong to the provided userId
      const authorizedDecks = decks.filter((deck) => deck.userId === userId);

      if (authorizedDecks.length !== decks.length) {
        console.warn(
          `Unauthorized attempt to duplicate decks for user ${userId}`,
        );
        // Throw error or return an empty array/null based on desired behavior
        throw new Error('Unauthorized to duplicate one or more decks');
      }

      // Proceed with duplication only for authorized decks
      const createdDecks = await Promise.all(
        authorizedDecks.map(async (deck) => {
          // Create a duplicate deck with the necessary properties
          return this.repo.create({
            // Required by DeckInfo interface
            id: '', // This will be replaced by MongoDB
            userId: userId,
            name: `${deck.name} (Copy)`,
            imageUrl: deck.imageUrl,
            colors: [...deck.colors],
            format: deck.format,
            description: deck.description,
            type: deck.type,
            // Required by DBDeck interface
            maindeck: [...deck.maindeck],
            sideboard: [...deck.sideboard],
            maybeboard: [...deck.maybeboard],
          });
        }),
      );

      return createdDecks;
    } catch (e) {
      console.error(`Failed to duplicate decks for user ${userId}:`, e);
      // Re-throw or handle as appropriate
      throw new Error('Failed to duplicate decks');
    }
  }

  async findByType(userId: string, type: 'paper' | 'arena') {
    try {
      // Directly query using the provided userId and type
      return await this.repo.findBy({ userId, type });
    } catch (e) {
      console.error(`Failed to get decks for user ${userId} by type:`, e);
      throw new Error('Failed to get decks by type');
    }
  }

  async findByUserId(userId: string) {
    try {
      // Directly query using the provided userId
      return await this.repo.findBy({ userId });
    } catch (e) {
      console.error(`Failed to get decks for user ${userId}:`, e);
      throw new Error('Failed to get user decks');
    }
  }

  async findByUserIdAndType(userId: string, type: 'paper' | 'arena') {
    try {
      // Directly query using the provided userId and type
      return await this.repo.findBy({ userId, type });
    } catch (e) {
      console.error(`Failed to get decks for user ${userId} by type:`, e);
      throw new Error('Failed to get user decks by type');
    }
  }

  async findById(userId: string, id: string): Promise<DBDeck | null> {
    try {
      // Fetch the specific deck
      const decks = await this.repo.get([id]);
      const deck = decks?.[0];

      // Verify the deck belongs to the provided userId
      if (!deck || deck.userId !== userId) {
        console.warn(
          `Attempt to access unauthorized deck ${id} by user ${userId}`,
        );
        return null; // Return null if not found or not authorized
      }

      return deck;
    } catch (e) {
      console.error(`Failed to get deck ${id} for user ${userId}:`, e);
      throw new Error('Failed to get deck by id');
    }
  }
}

export const deckService = new DeckService();
