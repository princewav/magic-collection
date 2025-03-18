'use server';

import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { deckService } from '@/db/services/DeckService';
import { Card, CardWithQuantity } from '@/types/card';
import { CollectionCard } from '@/types/card';
import { Deck } from '@/types/deck';
import { loadCardsById } from '../load-cards';

// Helper function to process cards for a deck section
export async function getMissingCards(deckId: string): Promise<CardWithQuantity[]> {
  // Get deck data
  const decks = await deckService.repo.get([deckId]);
  const deck = decks?.[0];

  if (!deck) {
    throw new Error('Deck not found');
  }

  // Combine maindeck and sideboard for collection checking
  const allDeckCards = [...(deck.maindeck || []), ...(deck.sideboard || [])];

  // Get all unique card names
  const cardNames = allDeckCards.map((card) => card.name);

  // Load collection data in a single call
  const collectionCards = await loadCollectionCardsByName(cardNames);
  console.log(collectionCards.map((card) => ({ name: card.name, quantity: card.quantity })));
  const collectionCardIds = collectionCards.map((card) => card.cardId);
  const collectionCardsWithDetailsAndQuantity = await Promise.all(
    collectionCardIds.map(async (cardId) => {
      const cards = await loadCardsById([cardId]);
      const card = cards?.[0];
      return {
        ...card,
        quantity: collectionCards.find((c) => c.name === card.name)?.quantity || 0,
      };
    }),
  );

  const collectionMap = collectionCardsWithDetailsAndQuantity.reduce((map, card) => {
    const current = map.get(card.name) || card;
    console.log(current);
    map.set(card.name, { ...current, quantity: current.quantity + card.quantity });
    return map;
  }, new Map<string, CardWithQuantity>());
  
 

  // // Create a map to store card details by name for later reference
  // const cardDetailsMap = new Map<string, Card>();

  // // Populate card details map with full card information
  // allDeckCards.forEach((card) => {
  //   if (!cardDetailsMap.has(card.name)) {
  //     // Store all properties except quantity
  //     const { quantity, ...cardDetails } = card;
  //     cardDetailsMap.set(card.name, cardDetails);
  //   }
  // });

  // // Calculate missing cards with full card details
  // const missingCardsMap = allDeckCards.reduce((map, card) => {
  //   const collected = collectionMap.get(card.name) || 0;
  //   const missing = Math.max(0, card.quantity - collected);

  //   if (missing > 0) {
  //     const current = map.get(card.name) || 0;
  //     map.set(card.name, current + missing);
  //   }

  //   return map;
  // }, new Map<string, number>());

  // // Convert to array result with full card details
  // return Array.from(missingCardsMap.entries()).map(([name, quantity]) => {
  //   // Get the card details and add the missing quantity
  //   const cardDetails = cardDetailsMap.get(name);
  //   return {
  //     ...cardDetails,
  //     name,
  //     quantity,
  //   } as CardWithQuantity;
  // });
}

function formatCardsToText(cards: { name: string; quantity: number }[]) {
  return cards.map((card) => `${card.name} x${card.quantity}`).join('\n');
}

export async function downloadMissingCards(deck: Deck) {
  try {
    const missingCards = await getMissingCards(deck.id);

    return {
      content: formatCardsToText(missingCards),
      filename: `Missing_${deck?.name.replace(' ', '_')}.txt`,
    };
  } catch (error) {
    throw new Error('Failed to generate missing cards list');
  }
}

export async function getMissingCardsText(deck: Deck) {
  try {
    const missingCards = await getMissingCards(deck.id);
    return formatCardsToText(missingCards);
  } catch (error) {
    throw new Error('Failed to get missing cards text');
  }
}
