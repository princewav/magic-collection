'use server';

import { loadFilteredCards, FilterOptions } from './load-cards';
import { fetchCollectionCards } from './load-cards';
import { CardWithOptionalQuantity } from '@/types/card';

export async function fetchCards(
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 50,
  deduplicate: boolean = true,
  collectionType?: 'paper' | 'arena',
): Promise<{ cards: CardWithOptionalQuantity[]; total: number }> {
  try {
    if (collectionType) {
      return await fetchCollectionCards(
        collectionType,
        filters,
        page,
        pageSize,
      );
    } else {
      return await loadFilteredCards(filters, page, pageSize, deduplicate);
    }
  } catch (error) {
    console.error('Error fetching cards:', error);
    return { cards: [], total: 0 };
  }
}
