import { Metadata } from 'next';
import { Suspense } from 'react';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/card-modal/CardModal';
import { CardContainer } from '@/components/CardContainer';
import { CardModalProvider } from '@/context/CardModalContext';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { ViewToggleContainer } from '@/components/ViewToggleContainer';
import { LayoutAwareSkeleton } from '@/components/LayoutAwareSkeleton';
import { parseFiltersFromParams } from '@/lib/filter-utils';
import { PageProps } from '@/types/next';

export const metadata: Metadata = {
  title: 'MTG Collection',
};

export default async function Page({ searchParams }: PageProps) {
  // Parse filters from URL search params with enhanced multicolor support
  const resolvedSearchParams = await searchParams;
  const { filters, deduplicate, page, pageSize } =
    parseFiltersFromParams(resolvedSearchParams);

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
