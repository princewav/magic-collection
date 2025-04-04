import { notFound } from 'next/navigation';

import { Filters } from '@/components/Filters';
import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import { Separator } from '@/components/ui/separator';
import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { MissingCardsModal } from '@/components/deck/MissingCardsModal';
import { MissingCardsModalProvider } from '@/context/MissingCardsModalContext';

interface Props {
  params: Promise<{ id: string; type: 'paper' | 'arena' }>;
}

async function getCollectedQuantities(cardList: any[] | undefined) {
  const cardNames = cardList?.map((card) => card.name) || [];
  const collectedCards = await loadCollectionCardsByName(cardNames);

  return Object.values(
    collectedCards.reduce<Record<string, { name: string; quantity: number }>>(
      (acc, card) => {
        acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
        acc[card.name].quantity += card.quantity;
        return acc;
      },
      {},
    ),
  );
}
export default async function DeckDetailPage({ params }: Props) {
  const { id, type } = await params;
  const deck = await loadDeckById(id);

  if (!deck) {
    return notFound();
  }

  const maindeckOwned = await getCollectedQuantities(deck?.maindeck);
  const sideboardOwned = await getCollectedQuantities(deck?.sideboard);

  return (
    <div className="container mx-auto p-4">
      <MissingCardsModalProvider>
        <DeckInfo deck={deck} />
        <MissingCardsModal />
        <CardModalProvider>
          {/* <Filters /> */}
          <h2 className="mt-8 mb-3 text-xl font-bold md:text-2xl">Main Deck</h2>
          <DeckCardGrid
            decklist={deck.maindeck}
            collectedCards={maindeckOwned}
            type={type}
            board="maindeck"
          />
          <Separator className="my-10 h-2" />
          <h2 className="mt-0 text-2xl font-bold">Sideboard</h2>
          <DeckCardGrid
            decklist={deck.sideboard}
            collectedCards={sideboardOwned}
            type={type}
            board="sideboard"
          />
          <CardModal />
        </CardModalProvider>
      </MissingCardsModalProvider>
    </div>
  );
}
