import { Metadata } from 'next';
import { Suspense } from 'react';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/card-modal/CardModal';
import { CardContainer } from '@/components/CardContainer';
import { getFiltersFromSearchParams } from '@/lib/url-params';
import { CardModalProvider } from '@/context/CardModalContext';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { ViewToggleContainer } from '@/components/ViewToggleContainer';
import { LayoutAwareSkeleton } from '@/components/LayoutAwareSkeleton';
import { FilterOptions } from '@/actions/card/load-cards';

export const metadata: Metadata = {
  title: 'MTG Collection',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Parse filter parameters from URL search params with proper type conversion
 */
function parseFiltersFromParams(searchParams: PageProps['searchParams']): {
  filters: FilterOptions;
  deduplicate: boolean;
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

  // Deduplicate option (one card per name)
  const dedupeParam = getParam('dedupe');
  const deduplicate = dedupeParam !== 'false'; // Default to true unless explicitly set to false

  return { filters, deduplicate, page, pageSize };
}

export default function Page({ searchParams }: PageProps) {
  // Parse filters from URL search params
  const { filters, deduplicate, page, pageSize } =
    parseFiltersFromParams(searchParams);

  return (
    <CardModalProvider>
      <CardsProvider
        initialCards={[]}
        initialTotal={0}
        initialFilters={filters}
        initialDeduplicate={deduplicate}
      >
        <CollectionProvider collectionType="paper" initialFilters={filters}>
          <div className="min-h-screen px-4 pt-2 pb-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Card Explorer</h1>
              <div className="flex items-center">
                <ViewToggleContainer />
              </div>
            </div>
            <Filters className="mb-4" />
            <Suspense fallback={<LayoutAwareSkeleton />}>
              <CardContainer
                filters={filters}
                page={page}
                pageSize={pageSize}
                deduplicate={deduplicate}
              />
            </Suspense>
            <CardModal />
          </div>
        </CollectionProvider>
      </CardsProvider>
    </CardModalProvider>
  );
}
