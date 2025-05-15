'use server';

import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { deckService } from '@/db/services/DeckService';
import { Card, CardWithQuantity, CollectionCard } from '@/types/card';
import { loadCardDetailsByNames } from '../card/load-cards';

// Aggregates CollectionCards by name to get total owned quantity per name
function aggregateCollectionCardsByName(
  cards: CollectionCard[],
): Map<string, number> {
  return cards.reduce((map, card) => {
    map.set(card.name, (map.get(card.name) || 0) + card.quantity);
    return map;
  }, new Map<string, number>());
}

export async function getMissingCards(
  deckId: string,
): Promise<CardWithQuantity[]> {
  const decks = await deckService.repo.get([deckId]);
  const deck = decks?.[0];

  if (!deck) {
    throw new Error('Deck not found');
  }

  // 1. Aggregate required card quantities by name from the deck
  const requiredCardsMap = [
    ...(deck.maindeck || []),
    ...(deck.sideboard || []),
  ].reduce((map, card) => {
    map.set(card.name, (map.get(card.name) || 0) + card.quantity);
    return map;
  }, new Map<string, number>());

  const uniqueCardNames = [...requiredCardsMap.keys()];

  if (uniqueCardNames.length === 0) {
    return []; // No cards in deck
  }

  // 2. Load owned cards from collection matching the names to determine owned quantities
  const collectionCards = await loadCollectionCardsByName(uniqueCardNames);
  const ownedQuantityMap = aggregateCollectionCardsByName(collectionCards);

  // 3. Load full Card details for ALL unique cards needed by the deck using the new action
  const allCardDetails = await loadCardDetailsByNames(uniqueCardNames);
  const cardDetailsMap = allCardDetails.reduce(
    (map: Map<string, Card>, card: Card) => {
      // If multiple prints exist for a name, the last one processed wins.
      // Consider more sophisticated logic if specific printings are needed.
      map.set(card.name, card);
      return map;
    },
    new Map<string, Card>(),
  );

  // 4. Calculate missing cards and compile the final list with full details
  const missingCards: CardWithQuantity[] = [];
  for (const [name, requiredQuantity] of requiredCardsMap.entries()) {
    const ownedQuantity = ownedQuantityMap.get(name) || 0;
    const missingQuantity = Math.max(0, requiredQuantity - ownedQuantity);

    if (missingQuantity > 0) {
      const cardDetail = cardDetailsMap.get(name);

      if (cardDetail) {
        // Full details should always be available now
        missingCards.push({ ...cardDetail, quantity: missingQuantity });
      } else {
        // This indicates an issue: the card is required by the deck,
        // but its details weren't found in the main card database by loadCardDetailsByNames.
        // This could happen if the decklist contains names not in the database.
        console.error(
          `Could not find card details for required card: "${name}". Skipping.`,
        );
        // Depending on requirements, could throw an error or continue.
      }
    }
  }

  return missingCards;
}

function formatCardsToText(cards: { name: string; quantity: number }[]) {
  return cards.map((card) => `${card.quantity}x ${card.name}`).join('\n');
}

export async function downloadMissingCards(deckId: string) {
  try {
    const missingCards = await getMissingCards(deckId); // Returns CardWithQuantity[]
    const decks = await deckService.repo.get([deckId]);
    const deck = decks?.[0];

    if (!deck) {
      throw new Error('Deck not found');
    }

    // formatCardsToText only needs name and quantity, directly available
    return {
      content: formatCardsToText(missingCards),
      filename: `Missing_${deck?.name.replace(/\s+/g, '_')}.txt`,
    };
  } catch (error) {
    console.error('Error generating missing cards list:', error);
    throw new Error('Failed to generate missing cards list');
  }
}

export async function getMissingCardsText(deckId: string) {
  try {
    const missingCards = await getMissingCards(deckId); // Returns CardWithQuantity[]
    // formatCardsToText only needs name and quantity, directly available
    return formatCardsToText(missingCards);
  } catch (error) {
    console.error('Error getting missing cards text:', error);
    throw new Error('Failed to get missing cards text');
  }
}
