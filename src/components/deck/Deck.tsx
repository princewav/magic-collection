import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

import { ManaSymbol } from '@/components/ManaSymbol';
import { cn } from '@/lib/utils';

interface DeckProps {
  deck: {
    id: string;
    name: string;
    imageUrl: string | null;
    colors: string[];
  };
  onContextMenu: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    deckId: string,
  ) => void;
  onCheck: (deckId: string) => void;
  isChecked: boolean;
}

export const Deck: React.FC<DeckProps> = ({
  deck,
  onContextMenu,
  onCheck,
  isChecked,
}) => {
  const [localChecked, setLocalChecked] = useState(isChecked);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation(); // Stop event propagation
      onContextMenu(e, deck.id);
    },
    [deck.id, onContextMenu],
  );

  const handleCheckboxChange = useCallback(() => {
    const newCheckState = !localChecked;
    setLocalChecked(newCheckState);
    onCheck(deck.id);
    console.log(deck.id, newCheckState);
  }, [deck.id, localChecked]);

  return (
    <div
      key={deck.id}
      className={cn(
        'group bg-card hover:bg-card/90 border-muted relative w-70 overflow-hidden rounded-lg border shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg',
        localChecked
          ? 'bg-foreground/10 hover:bg-foreground/20 scale-[1.06] hover:scale-[1.07]'
          : '',
      )}
    >
      <Checkbox
        id={`deck-${deck.id}`}
        className="border-primary/50 text-primary focus:border-primary focus:ring-primary absolute top-2 left-2 z-10 size-7 cursor-pointer rounded-full border-3 shadow-sm"
        checked={localChecked}
        onCheckedChange={handleCheckboxChange}
      />
      <Link href={`/decks/${deck.id}`} onContextMenu={handleContextMenu}>
        <div className="relative h-48 overflow-hidden">
          {deck.imageUrl ? (
            <Image
              src={deck.imageUrl}
              alt={deck.name}
              fill
              className="object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.06]"
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
