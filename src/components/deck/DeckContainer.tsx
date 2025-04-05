'use client';

import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { Separator } from '@/components/ui/separator';
import { MissingCardsModal } from '@/components/deck/MissingCardsModal';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';

interface DeckContainerProps {
  deck: any;
  maindeckOwned: any[];
  sideboardOwned: any[];
  type: 'paper' | 'arena';
}

export function DeckContainer({
  deck,
  maindeckOwned,
  sideboardOwned,
  type,
}: DeckContainerProps) {
  return (
    <div className="container mx-auto p-4">
      <CardModalProvider>
        <DeckInfo deck={deck} />
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
    </div>
  );
}
