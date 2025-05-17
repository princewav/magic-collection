import { Metadata } from 'next';
import { Suspense } from 'react';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';
import { Filters } from '@/components/Filters';
import {
  loadCardsById,
  loadCardsInCollection,
} from '@/actions/card/load-cards';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { CardContainer } from '@/components/CardContainer';
import { ViewToggleContainer } from '@/components/ViewToggleContainer';
import { LayoutAwareSkeleton } from '@/components/LayoutAwareSkeleton';
import { parseFiltersFromParams } from '@/lib/filter-utils';
import { PageProps } from '@/types/next';
import CardModal from '@/components/card-modal/CardModal';
import { CardModalProvider } from '@/context/CardModalContext';
import { fetchCards } from '@/actions/card/fetch-cards';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

type CollectionParams = {
  type: 'paper' | 'arena';
};

// Separate component for the cards container to allow Suspense to work properly
async function CollectionCards({
  type,
  filters,
  page,
  pageSize,
  initialCardsWithQuantity,
  totalUnique,
}: {
  type: string;
  filters: any;
  page: number;
  pageSize: number;
  initialCardsWithQuantity: any[];
  totalUnique: number;
}) {
  // Pre-fetch data to avoid transitions
  const dataPromise = fetchCards(
    filters,
    page,
    pageSize,
    false,
    type as 'paper' | 'arena',
  );

  // Ensure data is ready before rendering
  await dataPromise;

  return (
    <CardContainer
      filters={filters}
      collectionType={type as 'paper' | 'arena'}
      page={page}
      pageSize={pageSize}
      deduplicate={false}
      initialCardsWithQuantity={initialCardsWithQuantity}
      totalUnique={totalUnique}
    />
  );
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<CollectionParams>) {
  const { type } = await params;
  const resolvedSearchParams = await searchParams;
  const { filters, page, pageSize } =
    parseFiltersFromParams(resolvedSearchParams);

  // Pre-fetch all data needed before rendering
  const collectionCardsPromise = loadCardsInCollection(type);
  const collectionCards = await collectionCardsPromise;

  const totalQuantity = collectionCards.reduce(
    (acc, card) => acc + card.quantity,
    0,
  );
  const totalUnique = collectionCards.length;

  const initialCardIds = collectionCards
    .slice(0, pageSize)
    .map((card) => card.cardId);
  const initialCardsData = await loadCardsById(initialCardIds);

  const initialCardsWithQuantity = initialCardsData.map((card) => ({
    ...card,
    quantity:
      collectionCards.find((c) => c.cardId === card.cardId)?.quantity || 0,
  }));

  return (
    <CardModalProvider>
      <CollectionProvider collectionType={type} initialFilters={filters}>
        <CardsProvider
          initialCards={initialCardsWithQuantity}
          initialTotal={totalUnique}
          initialCollectionType={type}
          initialFilters={filters}
        >
          <main className="flex flex-col p-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {capitalize(type)} collection:{' '}
                <span className="font-normal normal-case">
                  {totalUnique} unique cards ({totalQuantity} total)
                </span>
              </h1>
              <div className="flex items-center gap-4">
                <ViewToggleContainer />
                <CsvImportButton
                  collectionType={type}
                  parseCsv={parseCSVandInsert}
                />
              </div>
            </div>
            <Filters className="mb-4" collectionType={type} />
            <Suspense fallback={<LayoutAwareSkeleton />}>
              <CollectionCards
                type={type}
                filters={filters}
                page={page}
                pageSize={pageSize}
                initialCardsWithQuantity={initialCardsWithQuantity}
                totalUnique={totalUnique}
              />
            </Suspense>
            <CardModal />
          </main>
        </CardsProvider>
      </CollectionProvider>
    </CardModalProvider>
  );
}
