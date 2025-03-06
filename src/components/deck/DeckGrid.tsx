'use client';

import React, { useState } from 'react';
import { Deck } from '@/components/deck/Deck';
import { useDeckSelection } from '@/context/DeckSelectionContext';
import { Deck as DeckType } from '@/types/deck';
import { DeleteDecksButton } from './DeleteDecksButton';
import { DeckContextMenu } from './DeckContextMenu';

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
    <div className="relative flex flex-wrap gap-6">
      {selectedDecks.length > 0 && (
        <DeleteDecksButton deckCount={selectedDecks.length} />
      )}
      {decks.map((deck) => (
        <Deck key={deck.id} deck={deck} onContextMenu={handleContextMenu} />
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
