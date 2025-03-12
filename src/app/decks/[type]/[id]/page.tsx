import { notFound } from 'next/navigation';

import { Filters } from '@/components/Filters';
import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/CardModal';
import { Separator } from '@/components/ui/separator';
import { loadCollectionCardsByName } from '@/actions/deck/load-decks';

interface Props {
  params: Promise<{ id: string; type: 'paper' | 'arena' }>;
}

export default async function DeckDetailPage({ params }: Props) {
  const { id, type } = await params;
  const deck = await loadDeckById(id);
  const maindeckCardNames = deck?.maindeck?.map((card) => card.name) || [];
  const maindeckCollectedCards =
    await loadCollectionCardsByName(maindeckCardNames);
  const maindeckCollectedQuantities = Object.values(
    maindeckCollectedCards.reduce<Record<string, { name: string; quantity: number }>>((acc, card) => {
      acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
      acc[card.name].quantity += card.quantity;
      return acc;
    }, {}),
  );
  const sideboardCardNames = deck?.sideboard?.map((card) => card.name) || [];
  const sideboardCollectedCards =
    await loadCollectionCardsByName(sideboardCardNames);
  const sideboardCollectedQuantities = Object.values(
    sideboardCollectedCards.reduce<Record<string, { name: string; quantity: number }>>((acc, card) => {
      acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
      acc[card.name].quantity += card.quantity;
      return acc;
    }, {}),
  );
  if (!deck) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <DeckInfo deck={deck} />
      <CardModalProvider>
        <Filters />
        <h2 className="text-2xl font-bold">Main Deck</h2>
        <DeckCardGrid
          decklist={deck.maindeck}
          collectedCards={maindeckCollectedQuantities}
          type={type}
        />
        <Separator className="my-10 h-2" />
        <h2 className="mt-0 text-2xl font-bold">Sideboard</h2>
        <DeckCardGrid
          decklist={deck.sideboard}
          collectedCards={sideboardCollectedQuantities}
          type={type}
        />
        <CardModal />
      </CardModalProvider>
    </div>
  );
}
