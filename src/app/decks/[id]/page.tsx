import { notFound } from 'next/navigation';

import { Filters } from '@/components/Filters';
import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/CardModal';
import { Separator } from '@/components/ui/separator';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DeckDetailPage({ params }: Props) {
  const { id } = await params;
  const deck = await loadDeckById(id);

  if (!deck) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <DeckInfo deck={deck} />
      <CardModalProvider>
        <Filters />
        <h2 className="text-2xl font-bold">Main Deck</h2>
        <DeckCardGrid decklist={deck.maindeck} />
        <Separator className="my-10 h-2" />
        <h2 className="mt-0 text-2xl font-bold">Sideboard</h2>
        <DeckCardGrid decklist={deck.sideboard} />
        <CardModal />
      </CardModalProvider>
    </div>
  );
}
