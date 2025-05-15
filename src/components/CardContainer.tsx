'use server';

import { CardClientView } from '@/components/CardClientView';
import { fetchCards } from '@/actions/card/fetch-cards';

interface CardContainerProps {
  filters: any;
  page: number;
  pageSize: number;
  deduplicate: boolean;
  collectionType?: 'paper' | 'arena';
}

export async function CardContainer({
  filters,
  page,
  pageSize,
  deduplicate,
  collectionType,
}: CardContainerProps) {
  // Server-side data fetching that will work with Suspense
  const cardsData = await fetchCards(
    filters,
    page,
    pageSize,
    deduplicate,
    collectionType,
  );

  return (
    <CardClientView cardsData={cardsData} collectionType={collectionType} />
  );
}
