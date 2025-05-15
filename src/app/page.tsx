import { Metadata } from 'next';
import { Suspense } from 'react';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/card-modal/CardModal';
import { CardContainer } from '@/components/CardContainer';
import { getFiltersFromSearchParams } from '@/lib/url-params';
import { Skeleton } from '@/components/ui/skeleton';
import { CardModalProvider } from '@/context/CardModalContext';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { ViewToggleContainer } from '@/components/ViewToggleContainer';

export const metadata: Metadata = {
  title: 'MTG Collection',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function CardGridSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="w-72 sm:w-[min(100%,275px)]">
          <Skeleton className="h-[330px] w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default async function Page({ searchParams }: PageProps) {
  const { filters, deduplicate, page } = getFiltersFromSearchParams(
    await searchParams,
  );
  const pageSize = 50;

  return (
    <CardModalProvider>
      <CardsProvider initialCards={[]} initialTotal={0}>
        <CollectionProvider collectionType="paper">
          <div className="min-h-screen px-4 pt-2 pb-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Card Explorer</h1>
              <div className="flex items-center">
                <ViewToggleContainer />
              </div>
            </div>
            <Filters className="mb-4" />
            <Suspense fallback={<CardGridSkeleton />}>
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
