'use server';

import { cardService } from "@/db/services/CardService";
import { Card } from "@/types/card";

export async function loadCardsById(ids: string[]): Promise<Card[]> {
  const cards = await cardService.repo.get(ids);
  if (!cards) {
    throw new Error('Failed to load cards with ids: ' + ids.join(', '));
  }
  return cards;
} 
