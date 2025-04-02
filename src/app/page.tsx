import { Metadata } from 'next';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/CardModal';
import { CardModalProvider } from '@/context/CardModalContext';
import { CardsProvider } from '@/context/CardsContext';
import { CardGrid } from '@/components/CardGrid';
import { loadFilteredCards } from '@/actions/card/load-cards';
import { getFiltersFromSearchParams } from '@/lib/url-params';

export const metadata: Metadata = {
  title: 'MTG Collection',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { filters, deduplicate, page } =
    getFiltersFromSearchParams(await searchParams);
  const pageSize = 50;

  const { cards, total } = await loadFilteredCards(
    filters,
    page,
    pageSize,
    deduplicate,
  );

  return (
    <CardsProvider initialCards={cards} initialTotal={total}>
      <div className="min-h-screen px-4 pt-2 pb-4">
        <Filters className="mb-4" />
        <CardModalProvider>
          <CardGrid />
          <CardModal />
        </CardModalProvider>
      </div>
    </CardsProvider>
  );
}
