// src/components/deck/Deck.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ManaSymbol } from '@/components/ManaSymbol';

interface DeckProps {
  deck: {
    id: string;
    name: string;
    imageUrl: string | null;
    colors: string[];
  };
  handleContextMenu: (event: React.MouseEvent, deckId: string) => void;
}

export const Deck: React.FC<DeckProps> = ({ deck, handleContextMenu }) => {
  return (
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
              <span className="text-muted-foreground">No image available</span>
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
  );
};
