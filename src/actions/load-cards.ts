'use server';

import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import { Card, CollectionCard } from '@/types/card';

export async function loadCardsById(ids: string[]): Promise<Card[]> {
  const cards = await cardService.getByCardId(ids);
  if (!cards) {
    throw new Error('Failed to load cards with ids: ' + ids.join(', '));
  }
  return cards;
}

export async function loadCardDetailsByNames(names: string[]): Promise<Card[]> {
  if (!names || names.length === 0) {
    return [];
  }
  const cards = await cardService.getCardsByNames(names);
  if (!cards) {
    // getCardsByNames returns [], so this check might be redundant, but keep for safety
    console.warn(
      'loadCardDetailsByNames received null/undefined from service for names:',
      names.join(', '),
    );
    return [];
  }
  return cards;
}

export async function loadCardsInCollection(
  type: 'paper' | 'arena',
): Promise<CollectionCard[]> {
  const cards = await collectionCardService.getByType(type);
  if (!cards) {
    throw new Error('Failed to load cards in collection: ' + type);
  }
  return cards;
}
