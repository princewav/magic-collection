'use server';

import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { deckService } from '@/db/services/DeckService';
import { CardWithQuantity } from '@/types/card';
import { CollectionCard } from '@/types/card';
import { loadCardsById } from '../load-cards';

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

export async function downloadMissingCards(deckId: string) {
  try {
    const missingCards = await getMissingCards(deckId);
    const decks = await deckService.repo.get([deckId]);
    const deck = decks?.[0];

    if (!deck) {
      throw new Error('Deck not found');
    }

    return {
      content: formatCardsToText(missingCards),
      filename: `Missing_${deck?.name.replace(' ', '_')}.txt`,
    };
  } catch (error) {
    throw new Error('Failed to generate missing cards list');
  }
}

export async function getMissingCardsText(deckId: string) {
  try {
    const missingCards = await getMissingCards(deckId);
    return formatCardsToText(missingCards);
  } catch (error) {
    throw new Error('Failed to get missing cards text');
  }
}
