'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteDecksButton } from './DeleteDecksButton';
import { useDeckSelection } from '@/context/DeckSelectionContext';

interface DecksHeaderProps {
  type: 'paper' | 'arena';
}

export function DecksHeader({ type }: DecksHeaderProps) {
  const { selectedDecks } = useDeckSelection();

  return (
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
  );
}
