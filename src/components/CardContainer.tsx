'use server';

import { CardClientView } from '@/components/CardClientView';
import { fetchCards } from '@/actions/card/fetch-cards';
import { CardWithOptionalQuantity } from '@/types/card';

interface CardContainerProps {
  filters: any;
  page: number;
  pageSize: number;
  deduplicate: boolean;
  collectionType?: 'paper' | 'arena';
  initialCardsWithQuantity?: CardWithOptionalQuantity[];
  totalUnique?: number;
}

export async function CardContainer({
  filters,
  page,
  pageSize,
  deduplicate,
  collectionType,
  initialCardsWithQuantity,
  totalUnique,
}: CardContainerProps) {
  // Server-side data fetching that will work with Suspense
  const cardsData =
    initialCardsWithQuantity && totalUnique
      ? { cards: initialCardsWithQuantity, total: totalUnique }
      : await fetchCards(filters, page, pageSize, deduplicate, collectionType);

  // Debug logging
  console.log('CardContainer Debug:', {
    hasInitialCards: Boolean(initialCardsWithQuantity),
    initialCardsLength: initialCardsWithQuantity?.length,
    totalUnique,
    fetchedCardsLength: cardsData.cards.length,
    total: cardsData.total,
    filters,
    page,
    pageSize,
    deduplicate,
    collectionType,
  });

  return (
    <CardClientView cardsData={cardsData} collectionType={collectionType} />
  );
}
