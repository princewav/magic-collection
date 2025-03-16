import { Deck } from '@/types/deck';
import { deckService } from '@/db/services/DeckService';
import { collectionCardService } from '@/db/services/CardService';
import { CollectionCard } from '@/types/card';
import { loadCardsById } from '@/actions/load-cards';

export async function loadDeckById(id: string): Promise<Deck | null> {
  try {
    const decks = await deckService.repo.get([id]);
    const deck = decks?.[0];
    if (!deck) {
      return null;
    }

    const processCardSection = async (
      section: Array<{
        cardId: string;
        quantity?: number;
        setNumber?: number;
      }> = [],
    ) => {
      const cardIds = section.map((card) => card.cardId);
      const cards = await loadCardsById(cardIds);

      return cards.map((card) => ({
        ...card,
        quantity: section.find((c) => c.cardId === card.cardId)?.quantity || 0,
        setNumber:
          section.find((c) => c.cardId === card.cardId)?.setNumber || 0,
      }));
    };

    const [maindeck, sideboard, maybeboard] = await Promise.all([
      processCardSection(deck.maindeck),
      processCardSection(deck.sideboard),
      processCardSection(deck.maybeboard),
    ]);

    return { ...deck, maindeck, sideboard, maybeboard };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load deck');
  }
}

export async function loadCollectionCardsById(
  cardIds: string[],
): Promise<CollectionCard[]> {
  try {
    const cards = await collectionCardService.getByCardId(cardIds);
    return cards ? cards : [];
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load collection cards');
  }
}

export async function loadCollectionCardsByName(
  cardNames: string[],
): Promise<CollectionCard[]> {
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
