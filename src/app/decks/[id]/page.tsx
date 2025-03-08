import { notFound } from 'next/navigation';

import { Filters } from '@/components/Filters';
import { CardGrid } from '@/components/CardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';

interface Props {
  params: {
    id: string;
  };
}

export default async function DeckDetailPage({ params }: Props) {
  const { id } = params;
  const deck = await loadDeckById(id);

  if (!deck) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <DeckInfo deck={deck} />
      <Filters />
      <CardGrid />
    </div>
  );
}
