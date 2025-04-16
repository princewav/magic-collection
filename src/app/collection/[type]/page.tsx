import { Metadata } from 'next';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';
import { Filters } from '@/components/Filters';
import { loadCardsById, loadCardsInCollection } from '@/actions/load-cards';
import { CardsProvider } from '@/context/CardsContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { CardContainer } from '@/components/CardContainer';
import { getFiltersFromSearchParams } from '@/lib/url-params';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

interface Props {
  params: Promise<{ type: 'paper' | 'arena' }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { type } = await params;
  const { filters /*, page, deduplicate */ } = getFiltersFromSearchParams(
    await searchParams,
  );
  const collectionCards = await loadCardsInCollection(type);

  const totalQuantity = collectionCards.reduce(
    (acc, card) => acc + card.quantity,
    0,
  );
  const totalUnique = collectionCards.length;
  const pageSize = 50;

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
    <CollectionProvider collectionType={type}>
      <CardsProvider
        initialCards={initialCardsWithQuantity}
        initialTotal={totalUnique}
        initialCollectionType={type}
      >
        <main className="flex flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {capitalize(type)} collection:{' '}
              <span className="font-normal normal-case">
                {totalUnique} unique cards (
                {totalQuantity} total)
              </span>
            </h1>
            <CsvImportButton
              collectionType={type}
              parseCsv={parseCSVandInsert}
            />
          </div>
          <Filters className="mb-4" />
          <CardContainer
            filters={filters}
            collectionType={type}
            page={1}
            pageSize={pageSize}
            deduplicate={false}
          />
        </main>
      </CardsProvider>
    </CollectionProvider>
  );
}
