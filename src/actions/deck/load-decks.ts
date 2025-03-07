import { Deck } from '@/types/deck';
import { deckRepository } from '@/repositories/DeckRepository';

export async function getDeckById(id: string): Promise<Deck> {
  try {
    return await deckRepository.findById(id);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load deck');
  }
}

export async function loadDecks(): Promise<Deck[]> {
  try {
    return await deckRepository.findAll();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load decks');
  }
}
