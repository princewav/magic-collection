'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ManaSymbol } from '../ManaSymbol';
import { ContextMenu } from './ContextMenu';

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

  const handleContextMenu = (
    e: React.MouseEvent<HTMLAnchorElement>,
    deckId: string,
  ) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, deckId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        contextMenu &&
        gridRef.current &&
        !gridRef.current.contains(e.target as Node)
      ) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenu]);

  return (
    <div className="flex flex-wrap gap-6" ref={gridRef}>
      {decks.map((deck) => (
        <div
          key={deck.id}
          className="bg-card hover:bg-card/90 border-muted w-70 overflow-hidden rounded-lg border shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <Link
            href={`/decks/${deck.id}`}
            onContextMenu={(e) => handleContextMenu(e, deck.id)}
          >
            <div className="relative h-48">
              {deck.imageUrl ? (
                <Image
                  src={deck.imageUrl}
                  alt={deck.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground">
                    No image available
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{deck.name}</h3>
              <div className="mt-2 flex gap-2">
                {deck.colors.map((color, index) => (
                  <ManaSymbol key={index} symbol={color} />
                ))}
              </div>
            </div>
          </Link>
        </div>
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

export default DeckGrid;
