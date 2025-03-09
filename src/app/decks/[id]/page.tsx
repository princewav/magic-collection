import { notFound } from 'next/navigation';

import { Filters } from '@/components/Filters';
import { DeckCardGrid } from '@/components/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/CardModal';

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
        <DeckCardGrid deck={deck} />
        <CardModal />
      </CardModalProvider>
    </div>
  );
}
