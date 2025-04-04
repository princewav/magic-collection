"use server";
import { SQLiteCardRepository } from "@/repositories/SQLiteCardRepository";
import { Card as CardType } from "@/models/Card";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function loadCardIds(page: number = 1): Promise<string[]> {
  const repository = new SQLiteCardRepository();
  const allCards = await repository.getAllCards();

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const cardSlice = allCards.slice(startIndex, endIndex);
  return cardSlice.map((card: CardType) => card.id);
}
