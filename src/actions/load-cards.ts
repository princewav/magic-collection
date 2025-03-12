'use server';

import { cardService, collectionCardService } from "@/db/services/CardService";
import { Card, CollectionCard } from "@/types/card";

export async function loadCardsById(ids: string[]): Promise<Card[]> {
  const cards = await cardService.repo.get(ids);
  if (!cards) {
    throw new Error('Failed to load cards with ids: ' + ids.join(', '));
  }
  return cards;
} 

export async function loadCardsInCollection(type: 'paper' | 'arena'): Promise<CollectionCard[]> {
  const cards = await collectionCardService.getByType(type);
  if (!cards) {
    throw new Error('Failed to load cards in collection: ' + type);
  }
  return cards;
}
