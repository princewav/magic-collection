import { Metadata } from 'next';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';
import { Filters } from '@/components/Filters';
import { loadCardsById, loadCardsInCollection } from '@/actions/load-cards';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { CardContainer } from '@/components/CardContainer';
import { ViewToggleContainer } from '@/components/ViewToggleContainer';
import { parseFiltersFromParams } from '@/lib/filter-utils';
import { PageProps } from '@/types/next';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

type CollectionParams = {
  type: 'paper' | 'arena';
};

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<CollectionParams>) {
  const { type } = await params;
  const resolvedSearchParams = await searchParams;
  const { filters, page, pageSize } =
    parseFiltersFromParams(resolvedSearchParams);
  const collectionCards = await loadCardsInCollection(type);

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
          <CardContainer
            filters={filters}
            collectionType={type}
            page={page}
            pageSize={pageSize}
            deduplicate={false}
          />
        </main>
      </CardsProvider>
    </CollectionProvider>
  );
}
