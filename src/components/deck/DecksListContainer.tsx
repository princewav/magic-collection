'use client';

import { DeckGrid } from '@/components/deck/DeckGrid';
import { DecksHeader } from '@/components/deck/DecksHeader';

interface DecksListContainerProps {
  decks: any[];
  type: 'paper' | 'arena';
}

export function DecksListContainer({ decks, type }: DecksListContainerProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <DecksHeader type={type} />

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
