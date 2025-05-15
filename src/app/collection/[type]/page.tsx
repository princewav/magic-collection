import { Metadata } from 'next';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';
import { Filters } from '@/components/Filters';
import { loadCardsById, loadCardsInCollection } from '@/actions/load-cards';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { CardContainer } from '@/components/CardContainer';
import { FilterOptions } from '@/actions/card/load-cards';
import { ViewToggleContainer } from '@/components/ViewToggleContainer';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

interface Props {
  params: { type: 'paper' | 'arena' };
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Parse filter parameters from URL search params
 */
function parseFiltersFromParams(searchParams: Props['searchParams']): {
  filters: FilterOptions;
  page: number;
  pageSize: number;
} {
  // Helper to get a single value from searchParams
  const getParam = (name: string): string | null => {
    const value = searchParams[name];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  // Parse filter values with proper defaults
  const filters: FilterOptions = {};

  // Colors
  const colorsParam = getParam('colors');
  if (colorsParam) {
    filters.colors = colorsParam.split(',');
  }

  // CMC Range
  const cmcParam = getParam('cmc');
  if (cmcParam) {
    const [min, max] = cmcParam.split(',').map((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? 0 : num;
    });
    filters.cmcRange = [min, max ?? 16];
  } else {
    filters.cmcRange = [0, 16]; // Default range
  }

  // Rarities
  const raritiesParam = getParam('rarities');
  if (raritiesParam) {
    filters.rarities = raritiesParam.split(',');
  }

  // Sets
  const setsParam = getParam('sets');
  if (setsParam) {
    filters.sets = setsParam.split(',');
  }

  // Exact color match
  const exactParam = getParam('exact');
  filters.exactColorMatch = exactParam === 'true';

  // Sort fields
  const sortParam = getParam('sort');
  if (sortParam) {
    filters.sortFields = sortParam.split(',').map((field) => {
      const [fieldName, order] = field.split(':');
      return {
        field: fieldName,
        order: (order || 'asc') as 'asc' | 'desc',
      };
    });
  }

  // Pagination
  const pageParam = getParam('page');
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

  const pageSizeParam = getParam('pageSize');
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 50;

  return { filters, page, pageSize };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { type } = params;
  const { filters, page, pageSize } = parseFiltersFromParams(searchParams);
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
