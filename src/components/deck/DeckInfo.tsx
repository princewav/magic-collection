'use client';

import Image from 'next/image';
import { Deck } from '@/types/deck';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookDashed, Download, Edit, Import } from 'lucide-react';
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
    <div className="bg-foreground/10 relative flex items-center justify-between overflow-hidden rounded-md p-4 shadow-md">
      <Image
        src={deck.imageUrl || '/placeholder-deck.jpg'}
        alt={deck.name}
        width={1500}
        height={1000}
        className="absolute inset-0 -z-10 rounded-md object-cover object-center opacity-30 md:hidden"
      />
      <div className="flex items-center space-x-4">
        <Image
          src={deck.imageUrl || '/placeholder-deck.jpg'}
          alt={deck.name}
          width={150}
          height={100}
          className="hidden rounded-md md:block"
        />
        <div>
          <h2 className="drop-shadow-black text-2xl font-semibold drop-shadow-xl">
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
          <p className="text-sm">
            <b>Main:</b> {mainboardCount} cards
          </p>
          <p className="text-sm">
            <b>Side:</b> {sideboardCount} cards
          </p>
          <p className="text-sm">
            <b>Total:</b> {mainboardCount + sideboardCount} cards
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between space-y-2">
        <Link href={`/decks/${type}/${deck.id}/edit`}>
          <Button className="md:w-40">
            <Edit />
            <span className="hidden md:block">Edit Deck</span>
          </Button>
        </Link>
        <Button className="md:w-40" onClick={() => openModal(deck.id)}>
          <BookDashed />
          <span className="hidden md:block">Missing Cards</span>
        </Button>
        {!pathname?.endsWith('/import') && (
          <Link href={`/decks/${type}/${deck.id}/import`}>
            <Button className="md:w-40">
              <Import />
              <span className="hidden md:block">Import List</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
