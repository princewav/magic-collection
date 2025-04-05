import { Metadata } from 'next';
import { Suspense } from 'react';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/card-modal/CardModal';
import { CardContainer } from '@/components/CardContainer';
import { getFiltersFromSearchParams } from '@/lib/url-params';
import { Skeleton } from '@/components/ui/skeleton';
import { CardModalProvider } from '@/context/CardModalContext';
import { CardsProvider } from '@/context/CardsContext';

export const metadata: Metadata = {
  title: 'MTG Collection',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-[330px] w-[240px] rounded-lg" />
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
        <div className="min-h-screen px-4 pt-2 pb-4">
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
      </CardsProvider>
    </CardModalProvider>
  );
}
