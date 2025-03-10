'use client';

import Image from 'next/image';
import { Deck } from '@/types/deck';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Import } from 'lucide-react';
import { ManaSymbol } from '@/components/ManaSymbol';
import { usePathname } from 'next/navigation';

interface Props {
  deck: Deck;
}

export const DeckInfo = ({ deck }: Props) => {
  const getColors = () => {
    if (!deck.colors) return [];

    if (typeof deck.colors === 'string') {
      try {
        return JSON.parse(deck.colors as string);
      } catch {
        return [deck.colors];
      }
    }

    if (Array.isArray(deck.colors)) {
      return deck.colors;
    }

    return [];
  };

  const mainboardCount = deck.maindeck?.reduce((acc, card) => acc + card.quantity, 0) || 0;
  const sideboardCount = deck.sideboard?.reduce((acc, card) => acc + card.quantity, 0) || 0;

  const colors = getColors();
  const pathname = usePathname();
  return (
    <div className="bg-foreground/10 mb-4 flex items-center justify-between rounded-md p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <Image
          src={deck.imageUrl || '/placeholder-deck.jpg'}
          alt={deck.name}
          width={150}
          height={100}
          className="rounded-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">
            {deck.name}{' '}
            <div className="flex items-center space-x-1 mt-1 mb-2">

            {Array.isArray(colors) && colors.length > 0
              ? colors.map((color) => (
                <ManaSymbol key={color} symbol={color} size={20} />
              ))
              : 'None'}
              </div>
          </h2>
          <div className="mt-1 flex items-center space-x-1"></div>
          <p className="text-sm">
            Main: {mainboardCount} cards
          </p>
          <p className="text-sm">
            Side: {sideboardCount} cards
          </p>
          <p className="text-sm">
            Total: {mainboardCount + sideboardCount} cards
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between space-y-2">
        <Link href={`/decks/${deck.id}/edit`}>
          <Button className="w-30" variant="outline">
            <Edit />
            Edit Deck
          </Button>
        </Link>
        {!pathname?.endsWith('/import') && (
          <Link href={`/decks/${deck.id}/import`}>
            <Button className="w-full" variant="outline">
              <Import />
              Import List
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
