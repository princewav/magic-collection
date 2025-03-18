'use server';

import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { deckService } from '@/db/services/DeckService';
import { Card, CardWithQuantity } from '@/types/card';
import { CollectionCard } from '@/types/card';
import { Deck } from '@/types/deck';
import { loadCardsById } from '../load-cards';

// fare una funzione che aggrega i risultati di loadCollectionCardsByName in modo da accomunare le stesse carte nelle varie foilature, quindi accumulare le quantità delle carte che hanno lo stesso cardId

function aggregateCards(cards: CollectionCard[]): CollectionCard[] {
  return cards.reduce((acc, card) => {
    const existingCard = acc.find((c) => c.cardId === card.cardId);
    if (existingCard) {
      existingCard.quantity += card.quantity;
    } else {
      acc.push(card);
    }
    return acc;
  }, [] as CollectionCard[]);
}

// Helper function to process cards for a deck section
export async function getMissingCards(
  deckId: string,
): Promise<CardWithQuantity[]> {
  const decks = await deckService.repo.get([deckId]);
  const deck = decks?.[0];

  if (!deck) {
    throw new Error('Deck not found');
  }

  const allDeckCards = [...(deck.maindeck || []), ...(deck.sideboard || [])];
  const cardNames = allDeckCards.map((card) => card.name);
  const collectionCards = await loadCollectionCardsByName(cardNames);
  const aggregatedCards = aggregateCards(collectionCards);
  const ownedCardIds = aggregatedCards.map((card) => card.cardId);
  const ownedCards = await loadCardsById(ownedCardIds);
  const ownedCardsWithQuantity = ownedCards.map((card) => ({
    ...card,
    quantity:
      collectionCards.find((c) => c.cardId === card.cardId)?.quantity || 0,
  }));

  const collectionMap = ownedCardsWithQuantity.reduce((map, card) => {
    map.set(card.name, {
      ...(map.get(card.name) || card),
      quantity: (map.get(card.name)?.quantity || 0) + card.quantity,
    });
    return map;
  }, new Map<string, CardWithQuantity>());

  const missingCardsMap = allDeckCards.reduce((map, card) => {
    const current = collectionMap.get(card.name);
    const missing = Math.max(0, card.quantity - (current?.quantity || 0));
    if (missing > 0 && current) {
      map.set(card.name, { ...current, quantity: missing } as CardWithQuantity);
    }
    return map;
  }, new Map<string, CardWithQuantity>());

  return Array.from(missingCardsMap.values());
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
