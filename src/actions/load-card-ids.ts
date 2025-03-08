'use server';
import { SQLiteCardRepository } from '@/db/SQLiteCardRepository';
import { Card as CardType } from '@/models/Card';
import { ITEMS_PER_PAGE } from '@/lib/constants';

export async function loadCardIds(page: number = 1): Promise<string[]> {
  return [];
}
