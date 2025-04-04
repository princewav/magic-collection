import { Deck } from '@/types/deck';
import { deckService } from '@/db/services/DeckService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import { Card, CollectionCard } from '@/types/card';
import { loadCardsById } from '@/actions/load-cards';
import { DBDeck } from '@/types/deck';

async function loadDeckCards(deck: DBDeck): Promise<Deck> {
  const processCardSection = async (
    section: Array<{
      cardId: string;
      quantity?: number;
      setNumber?: number;
    }> = [],
  ) => {
    if (!section || section.length === 0) {
      return [];
    }

    // 1. Get unique cardIds from the input section
    const uniqueCardIds = [...new Set(section.map((card) => card.cardId))];

    // 2. Fetch card objects - potentially containing duplicates if multiple printings share the same cardId
    const fetchedCards = await loadCardsById(uniqueCardIds);

    // 4. Map over the fetched (and now correctly deduplicated by the service) cards and calculate the total quantity for each
    return fetchedCards.map((card) => {
      // Find all entries in the original section that match the current unique cardId
      const matchingSectionEntries = section.filter(
        (c) => c.cardId === card.cardId,
      );

      // Sum the quantities from all matching entries in the original section
      const totalQuantity = matchingSectionEntries.reduce(
        (sum, entry) => sum + (entry.quantity || 0),
        0,
      );

      // Optionally, get setNumber from the first matching entry (adjust if needed)
      const setNumber = matchingSectionEntries[0]?.setNumber || 0;

      return {
        ...card,
        quantity: totalQuantity,
        setNumber: setNumber,
      };
    });
  };

  const [maindeck, sideboard, maybeboard] = await Promise.all([
    processCardSection(deck.maindeck),
    processCardSection(deck.sideboard),
    processCardSection(deck.maybeboard),
  ]);

  return { ...deck, maindeck, sideboard, maybeboard };
}

export async function loadDeckById(id: string): Promise<Deck | null> {
  try {
    const decks = await deckService.repo.get([id]);
    const deck = decks?.[0];
    if (!deck) {
      return null;
    }

    return await loadDeckCards(deck);
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
      const decks = await deckService.findByType(type);
      return await Promise.all(decks.map(loadDeckCards));
    }
    const decks = await deckService.repo.getAll();
    return await Promise.all(decks.map(loadDeckCards));
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load decks');
  }
}
