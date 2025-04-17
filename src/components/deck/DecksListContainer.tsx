'use client';

import { DeckGrid } from '@/components/deck/DeckGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DeleteDecksButton } from './DeleteDecksButton';
import { useDeckSelection } from '@/context/DeckSelectionContext';

interface DecksListContainerProps {
  decks: any[];
  type: 'paper' | 'arena';
}

export function DecksListContainer({ decks, type }: DecksListContainerProps) {
  const { selectedDecks } = useDeckSelection();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center text-2xl font-bold">{type} decks</h1>
        <div className="flex items-center gap-2">
          {selectedDecks.length > 0 && (
            <DeleteDecksButton deckCount={selectedDecks.length} />
          )}
          <Button asChild>
            <Link href="/decks/new">Add Deck</Link>
          </Button>
        </div>
      </div>
      {decks.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500">
            No {type} decks found. Create your first deck!
          </p>
        </div>
      ) : (
        <DeckGrid decks={decks} />
      )}
    </div>
  );
}
