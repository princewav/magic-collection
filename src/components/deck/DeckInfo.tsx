'use client';

import Image from 'next/image';
import { Deck } from '@/types/deck';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Download, Edit, Import } from 'lucide-react';
import { ManaSymbol } from '@/components/ManaSymbol';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useMissingCardsModal } from '@/context/MissingCardsModalContext';

interface Props {
  deck: Deck;
}

export const DeckInfo = ({ deck }: Props) => {
  const params = useParams();
  const type = params.type;
  const pathname = usePathname();
  const { openModal } = useMissingCardsModal();

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

  const mainboardCount =
    deck.maindeck?.reduce((acc, card) => acc + card.quantity, 0) || 0;
  const sideboardCount =
    deck.sideboard?.reduce((acc, card) => acc + card.quantity, 0) || 0;

  const colors = getColors();

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
            <div className="mt-1 mb-2 flex items-center space-x-1">
              {Array.isArray(colors) && colors.length > 0
                ? colors.map((color) => (
                    <ManaSymbol key={color} symbol={color} size={20} />
                  ))
                : 'None'}
            </div>
          </h2>
          <div className="mt-1 flex items-center space-x-1"></div>
          <p className="text-sm">Main: {mainboardCount} cards</p>
          <p className="text-sm">Side: {sideboardCount} cards</p>
          <p className="text-sm">
            Total: {mainboardCount + sideboardCount} cards
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between space-y-2">
        <Link href={`/decks/${type}/${deck.id}/edit`}>
          <Button className="w-40">
            <Edit />
            Edit Deck
          </Button>
        </Link>
        <Button className="w-40" onClick={() => openModal(deck.id)}>
          <Download />
          Missing Cards
        </Button>
        {!pathname?.endsWith('/import') && (
          <Link href={`/decks/${type}/${deck.id}/import`}>
            <Button className="w-40">
              <Import />
              Import List
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
