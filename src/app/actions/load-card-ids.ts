'use server';

import { SQLiteCardRepository } from "@/app/repositories/SQLiteCardRepository";
import { Card as CardType } from "@/app/models/Card";
import { INITIAL_CARD_LOAD_COUNT } from "@/constants";

export async function loadInitialCardIds(): Promise<string[]> {
  const repository = new SQLiteCardRepository();
  const allCards = await repository.getAllCards();
  const firstCardIds = allCards
    .slice(0, INITIAL_CARD_LOAD_COUNT)
    .map((card: CardType) => card.id);
  return firstCardIds;
}
