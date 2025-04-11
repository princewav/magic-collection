'use client';

import React, { useState } from 'react';
import { Deck } from '@/components/deck/Deck';
import { useDeckSelection } from '@/context/DeckSelectionContext';
import { Deck as DeckType } from '@/types/deck';
import { DeleteDecksButton } from './DeleteDecksButton';
import { DeckContextMenu } from './DeckContextMenu';
import { cn } from '@/lib/utils';

type DeckGridProps = {
  decks: DeckType[];
};

export const DeckGrid = ({ decks }: DeckGridProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    deckId: string;
  } | null>(null);
  const { selectedDecks } = useDeckSelection();

  const handleContextMenu = (
    e: React.MouseEvent<Element, MouseEvent>,
    deckId: string,
  ) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, deckId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div
      className={cn(
        'relative gap-6 space-y-4 px-6',
        'justify-center sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(200px,250px))] sm:space-y-0 sm:px-0',
      )}
    >
      {selectedDecks.length > 0 && (
        <DeleteDecksButton deckCount={selectedDecks.length} />
      )}
      {decks.map((deck) => (
        <Deck
          key={deck.id}
          deck={deck}
          onContextMenu={handleContextMenu}
          className="mx-auto w-full max-w-[300px]"
        />
      ))}
      {contextMenu && (
        <DeckContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          deckId={contextMenu.deckId}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};
