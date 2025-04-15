'use server';

import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import { Card, CollectionCard } from '@/types/card';
import { FilterOptions } from './card/load-cards';

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

const applyFiltersAndSort = (cards: any[], _filters: FilterOptions): any[] => {
  console.warn('applyFiltersAndSort is not implemented yet');
  return cards;
};

export async function loadMoreCollectionCards(
  type: 'paper' | 'arena',
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 50,
) {
  // 1. Get all collection cards for the user/type
  const collectionEntries = await collectionCardService.getByType(type);
  if (!collectionEntries) {
    return { cards: [], total: 0 };
  }
  const collectionCardsMap = new Map<string, number>();
  collectionEntries.forEach((entry) => {
    collectionCardsMap.set(entry.cardId, entry.quantity);
  });
  const allCardIds = Array.from(collectionCardsMap.keys());
  if (allCardIds.length === 0) {
    return { cards: [], total: 0 };
  }
  // 2. Fetch card details
  const cardDetails = await cardService.getByCardId(allCardIds);
  if (!cardDetails) {
    return { cards: [], total: 0 };
  }
  // 3. Combine details with quantity
  const detailedCollectionCards: (Card & { quantity: number })[] =
    cardDetails.map((card) => ({
      ...card,
      quantity: collectionCardsMap.get(card.cardId) || 0,
    }));
  // 4. Apply filters and sorting (in-memory)
  const filteredAndSortedCards = applyFiltersAndSort(
    detailedCollectionCards,
    filters,
  );
  // 5. Paginate
  const total = filteredAndSortedCards.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedCards = filteredAndSortedCards.slice(
    startIndex,
    startIndex + pageSize,
  );
  return { cards: paginatedCards, total };
}

export async function fetchCollectionCards(
  type: 'paper' | 'arena',
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 50,
) {
  // Use the new function for both initial and subsequent loads
  return loadMoreCollectionCards(type, filters, page, pageSize);
}
