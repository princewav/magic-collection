'use client';

import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { Separator } from '@/components/ui/separator';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[theme(spacing.16)_1fr_theme(spacing.16)]">
      <div className="hidden md:flex md:flex-col md:items-center md:justify-start md:pt-4">
        <Link
          href={`/decks/${type}`}
          className="flex flex-col items-center justify-center gap-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 gap-2 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground text-xs">To decks</span>
        </Link>
      </div>

      <div className="container mx-auto">
        <div className="md:hidden flex justify-start">
          <Link
            href={`/decks/${type}`}
            className="flex items-center justify-center gap-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
            <span className="text-muted-foreground text-xs">To {type} decks</span>
            </Button>
          </Link>
        </div>
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

      <div className="hidden md:block"></div>
    </div>
  );
}
