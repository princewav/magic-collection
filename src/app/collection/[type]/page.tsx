import { Metadata } from 'next';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';
import { Filters } from '@/components/Filters';
import { CollectionCardGrid } from '@/components/CollectionCardGrid';
import { loadCardsById, loadCardsInCollection } from '@/actions/load-cards';
import { CardsProvider } from '@/context/CardsContext';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

type Props = {
  params: Promise<{
    type: 'paper' | 'arena';
  }>;
};

export default async function CollectionPage({ params }: Props) {
  const { type } = await params;
  const collectionCards = await loadCardsInCollection(type);
  const quantity = collectionCards.reduce(
    (acc, card) => acc + card.quantity,
    0,
  );
  const cardIds = collectionCards.slice(50, 100).map((card) => card.cardId);
  const cards = await loadCardsById(cardIds);
  const cardsWithQuantity = cards.map((card) => ({
    ...card,
    quantity:
      collectionCards.find((c) => c.cardId === card.cardId)?.quantity || 0,
  }));

  return (
    <CardsProvider initialCards={cards} initialTotal={cards.length}>
      <main className="flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            {capitalize(type)} collection: {collectionCards.length} unique cards
            ({quantity} total)
          </h1>
          <CsvImportButton collectionType={type} parseCsv={parseCSVandInsert} />
        </div>
        <Filters className="mb-4" />
        <CollectionCardGrid cards={cardsWithQuantity} />
      </main>
    </CardsProvider>
  );
}
