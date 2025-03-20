"use client"

import React, { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

import { ManaSymbol } from '@/components/ManaSymbol';
import { capitalize, cn } from '@/lib/utils';
import { useDeckSelection } from '@/context/DeckSelectionContext';
import { Deck as DeckType } from '@/types/deck';
import { useParams } from 'next/navigation';

interface DeckProps {
  deck: DeckType;
  onContextMenu: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    deckId: string,
  ) => void;
}

export const Deck: React.FC<DeckProps> = ({ deck, onContextMenu }) => {
  const { selectedDecks, toggleDeckSelection } = useDeckSelection();
  const isChecked = selectedDecks.includes(deck.id);

  const { type } = useParams();

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, deck.id);
    },
    [deck.id, onContextMenu],
  );

  const handleCheckboxChange = useCallback(() => {
    toggleDeckSelection(deck.id);
  }, [deck.id, toggleDeckSelection]);

  return (
    <div
      key={deck.id}
      className={cn(
        'group bg-card hover:bg-card/90 border-muted relative w-50 overflow-hidden rounded-lg border shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg isolate',
        isChecked
          ? 'bg-foreground/10 hover:bg-foreground/20 scale-[1.06] hover:scale-[1.07]'
          : '',
      )}
    >
      <Checkbox
        id={`deck-${deck.id}`}
        className="border-primary/50 text-primary focus:border-primary focus:ring-primary absolute top-2 left-2 z-10 size-7 cursor-pointer rounded-full border-3 shadow-sm"
        checked={isChecked}
        onCheckedChange={handleCheckboxChange}
        stroke={3}
      />
      <Link href={`/decks/${type}/${deck.id}`} onContextMenu={handleContextMenu}>
        <div className="relative h-30 overflow-hidden">
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
          <div className="mt-2 text-white bg-black/70 absolute bottom-2 right-2 rounded-md px-2 py-1 text-sm">
            {capitalize(deck.format || '')}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{deck.name}</h3>
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
