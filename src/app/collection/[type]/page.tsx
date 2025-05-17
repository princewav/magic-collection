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
  const dataPromise = fetchCards(
    filters,
    page,
    pageSize,
    false,
    type as 'paper' | 'arena',
  );

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

  const collectionCardsPromise = loadCardsInCollection(type);
  const collectionCards = await collectionCardsPromise;

  // For initial server-side rendering, fetch all cards needed for the first page
  // This prevents flickering and ensures the UI is populated immediately
  const initialCardIds = collectionCards
    .slice(0, pageSize)
    .map((card) => card.cardId);
  const initialCardsData = await loadCardsById(initialCardIds);

  // Apply set filtering for the initial data display
  let filteredInitialCards = initialCardsData;
  let filteredCollectionCards = collectionCards;

  // Apply set filtering if sets filter is present
  if (filters.sets && filters.sets.length > 0) {
    // Convert set codes to uppercase for case-insensitive matching
    const setCodesUppercase = filters.sets.map((set) => set.toUpperCase());

    // Filter initial cards by set (case-insensitive)
    filteredInitialCards = initialCardsData.filter((card) =>
      setCodesUppercase.includes(card.set.toUpperCase()),
    );

    // Get the card IDs that match the set filter
    const filteredCardIds = filteredInitialCards.map((card) => card.cardId);

    // Filter collection cards to only include those with matching card IDs
    filteredCollectionCards = collectionCards.filter((card) =>
      filteredCardIds.includes(card.cardId),
    );
  }

  const totalQuantity = filteredCollectionCards.reduce(
    (acc, card) => acc + card.quantity,
    0,
  );
  const totalUnique = filteredCollectionCards.length;

  // Combine card data with quantities from collection
  const initialCardsWithQuantity = filteredInitialCards.map((card) => ({
    ...card,
    quantity:
      filteredCollectionCards.find((c) => c.cardId === card.cardId)?.quantity ||
      0,
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
