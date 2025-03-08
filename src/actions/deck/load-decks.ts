import { Deck } from '@/types/deck';
import { deckService } from '@/db/services/DeckService';

export async function loadDeckById(id: string): Promise<Deck | null> {
  try {
    const decks = await deckService.repo.get([id]);
    return decks?.[0] || null;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load deck');
  }
}

export async function loadDecks(): Promise<Deck[]> {
  try {
    return await deckService.repo.getAll();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load decks');
  }
}
