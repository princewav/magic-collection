import { Deck } from '@/types/deck';
import { deckService } from '@/db/services/DeckService';
import { collectionCardService } from '@/db/services/CardService';
import { CollectionCard } from '@/types/card';

export async function loadDeckById(id: string): Promise<Deck | null> {
  try {
    const decks = await deckService.repo.get([id]);
    return decks?.[0] || null;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load deck');
  }
}

export async function loadCollectionCardsById(cardIds: string[]): Promise<CollectionCard[]> {
  try {
    const cards = await collectionCardService.getByCardId(cardIds);
    return cards ? cards : [];
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load collection cards');
  }
}

export async function loadCollectionCardsByName(cardNames: string[]): Promise<CollectionCard[]> {
  try {
    const cards = await collectionCardService.getByCardNames(cardNames);
    return cards ? cards : [];
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load collection cards');
  }
}

export async function loadDecks(type?: 'paper' | 'arena'): Promise<Deck[]> {
  try {
    if (type) {
      return await deckService.findByType(type);
    }
    return await deckService.repo.getAll();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load decks');
  }
}
