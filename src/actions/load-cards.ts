'use server';

import { cardService, collectionCardService } from "@/db/services/CardService";
import { Card } from "@/types/card";

export async function loadCardsById(ids: string[]): Promise<Card[]> {
  const cards = await cardService.repo.get(ids);
  if (!cards) {
    throw new Error('Failed to load cards with ids: ' + ids.join(', '));
  }
  return cards;
} 

export async function loadCardsInCollection(type: string): Promise<Card[]> {
  const cards = await collectionCardService.getByType(type);
  if (!cards) {
    throw new Error('Failed to load cards in collection: ' + type);
  }
  return cards.slice(0, 50);
}
