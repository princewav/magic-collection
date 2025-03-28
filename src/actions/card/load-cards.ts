'use server';

import { cardService } from '@/db/services/CardService';

export interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sets?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
}

export async function loadFilteredCards(
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 20,
) {
  try {
    const { cards, total } = await cardService.getFilteredCardsWithPagination(
      filters,
      page,
      pageSize,
    );
    return { cards, total };
  } catch (error) {
    console.error('Error loading filtered cards:', error);
    return { cards: [], total: 0 };
  }
}
