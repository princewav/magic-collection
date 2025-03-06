'use client';
import React, { useState, useRef } from 'react';
import { ContextMenu } from './ContextMenu';
import { Deck } from '@/components/deck/Deck';

type DeckGridProps = {
  decks: {
    id: string;
    name: string;
    imageUrl: string | null;
    colors: string[];
  }[];
};

export const DeckGrid = ({ decks }: DeckGridProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    deckId: string;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [checkedDecks, setCheckedDecks] = useState<string[]>([]);

  const handleContextMenu = (
    e: React.MouseEvent<Element, MouseEvent>,
    deckId: string,
  ) => {
    setContextMenu({ x: e.clientX, y: e.clientY, deckId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleCheck = (deckId: string) => {
    setCheckedDecks((prev) =>
      prev.includes(deckId) ? prev.filter((id) => id !== deckId) : [...prev, deckId],
    );
  };

  const isDeckChecked = (deckId: string) => checkedDecks.includes(deckId);

  const handleGridClick = (e: React.MouseEvent) => {
    if (contextMenu && gridRef.current && !gridRef.current.contains(e.target as Node)) {
      closeContextMenu();
    }
  };

  return (
    <div
      className="flex flex-wrap gap-6"
      ref={gridRef}
      onClick={handleGridClick}
    >
      {decks.map((deck) => (
        <Deck
          key={deck.id}
          deck={deck}
          onCheck={handleCheck}
          onContextMenu={handleContextMenu}
          isChecked={isDeckChecked(deck.id)}
        />
      ))}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          deckId={contextMenu.deckId}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};
