'use client';

import Image from 'next/image';
import { Deck } from '@/types/deck';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookDashed, Edit, Import } from 'lucide-react';
import { ManaSymbol } from '@/components/ManaSymbol';
import { useParams, usePathname } from 'next/navigation';
import { useMissingCardsModal } from '@/context/MissingCardsModalContext';
import { calculateRarityTotals } from '@/lib/deck/utils';
import { CardWithQuantity } from '@/types/card';

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

  const allCards: CardWithQuantity[] = [
    ...(deck.maindeck || []),
    ...(deck.sideboard || []),
  ];
  const rarityTotals = calculateRarityTotals(allCards);

  return (
    <div
      data-role="deck-info-container"
      className="bg-foreground/10 relative flex items-center justify-between overflow-hidden rounded-md p-4 shadow-md"
    >
      <Image
        src={deck.imageUrl || '/placeholder-deck.jpg'}
        alt={deck.name}
        width={1500}
        height={1000}
        className="absolute inset-0 -z-10 rounded-md object-cover object-center opacity-15 md:hidden"
      />
      <div
        data-role="deck-details"
        className="flex w-full items-center space-x-4"
      >
        <Image
          src={deck.imageUrl || '/placeholder-deck.jpg'}
          alt={deck.name}
          width={150}
          height={100}
          className="hidden rounded-md md:block"
        />
        <div
          data-role="deck-details-grid"
          className="grid w-full grid-cols-2 gap-2"
        >
          <h2
            data-role="deck-name"
            className="drop-shadow-black col-span-2 text-2xl font-semibold drop-shadow-xl"
          >
            {deck.name}{' '}
          </h2>
          <div data-role="col-1" className="">
            <div
              data-role="deck-colors"
              className="mt-1 mb-2 flex items-center space-x-1"
            >
              {Array.isArray(colors) && colors.length > 0
                ? colors.map((color) => (
                    <ManaSymbol key={color} symbol={color} size={20} />
                  ))
                : 'None'}
            </div>
            <div
              data-role="card-counts"
              className="mt-1 flex items-center space-x-1"
            ></div>
            <p data-role="mainboard-count" className="text-sm">
              <b>Main:</b> {mainboardCount} cards
            </p>
            <p data-role="sideboard-count" className="text-sm">
              <b>Side:</b> {sideboardCount} cards
            </p>
            <p data-role="total-count" className="text-sm">
              <b>Total:</b> {mainboardCount + sideboardCount} cards
            </p>
          </div>
          <div
            data-role="col-2"
            className="flex flex-col items-start justify-end text-sm h-full"
          >
            <p className="flex items-center gap-1">
              <Image
                src="/images/rarities/common.png"
                alt="Common"
                width={16}
                height={16}
                className="size-5"
              />
              {rarityTotals.common || 0} Common
            </p>
            <p className="flex items-center gap-1">
              <Image
                src="/images/rarities/uncommon.png"
                alt="Uncommon"
                width={16}
                height={16}
                className="size-5"
              />
              {rarityTotals.uncommon || 0} Uncom.
            </p>
            <p className="flex items-center gap-1">
              <Image
                src="/images/rarities/rare.png"
                alt="Rare"
                width={16}
                height={16}
                className="size-5"
              />
              {rarityTotals.rare || 0} Rare
            </p>
            <p className="flex items-center gap-1">
              <Image
                src="/images/rarities/mythic.png"
                alt="Mythic"
                width={16}
                height={16}
                className="size-5"
              />
              {rarityTotals.mythic || 0} Mythic
            </p>
          </div>
        </div>
      </div>
      <div
        data-role="deck-actions-right"
        className="flex flex-col items-end justify-between space-y-2"
      >
        <Link href={`/decks/${type}/${deck.id}/edit`}>
          <Button data-role="edit-deck-button" className="md:w-40">
            <Edit />
            <span data-role="edit-deck-text" className="hidden md:block">
              Edit Deck
            </span>
          </Button>
        </Link>
        <Button
          data-role="missing-cards-button"
          className="md:w-40"
          onClick={() => openModal(deck.id)}
        >
          <BookDashed />
          <span data-role="missing-cards-text" className="hidden md:block">
            Missing Cards
          </span>
        </Button>
        {!pathname?.endsWith('/import') && (
          <Link href={`/decks/${type}/${deck.id}/import`}>
            <Button data-role="import-list-button" className="md:w-40">
              <Import />
              <span data-role="import-list-text" className="hidden md:block">
                Import List
              </span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
