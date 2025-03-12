import { Metadata } from 'next';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';
import { Filters } from '@/components/Filters';
import { CardGrid } from '@/components/CardGrid';
import { loadCardsById, loadCardsInCollection } from '@/actions/load-cards';

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
  const cardIds = collectionCards.map((card) => card.cardId);
  const cards = await loadCardsById(cardIds);
  const cardsWithQuantity = cards.map((card) => ({
    ...card,
    quantity: collectionCards.find((c) => c.cardId === card.id)?.quantity || 0,
  }));


  return (
    <main className="flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold">{capitalize(type)} collection</h1>
        <CsvImportButton collectionType={type} parseCsv={parseCSVandInsert} />
      </div>
      <Filters />
      <CardGrid cards={cardsWithQuantity} />
    </main>
  );
}
