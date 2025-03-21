'use client';

import { loadCardsById } from '@/actions/load-cards';
import { Card as CardType } from '@/types/card';
import { defaultSort } from '@/lib/deck/sorting';
import Image from 'next/image';
import { Card } from '../Card';
import { CardWithQuantity } from '@/types/card';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { updateCardQuantity } from '@/actions/deck/update-card-quantity';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';

interface Props {
  decklist?: CardWithQuantity[];
  collectedCards?: { name: string; quantity: number }[];
  type: 'paper' | 'arena';
  board: 'maindeck' | 'sideboard';
}

export function DeckCardGrid({ decklist, collectedCards, type, board }: Props) {
  const params = useParams();
  const deckId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [cardsWithQuantity, setCardsWithQuantity] = useState<
    CardWithQuantity[]
  >([]);
  const [rarityTotals, setRarityTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadCards = async () => {
      if (!decklist) return;

      const cardIds: string[] =
        decklist.map((card) => card.cardId).filter(Boolean) || [];
      const cards = await loadCardsById(cardIds);
      const sortedCards = defaultSort(cards);
      const withQuantity: CardWithQuantity[] = sortedCards.map(
        (card: CardType) => ({
          ...card,
          quantity:
            decklist?.find((c) => c.cardId === card.cardId)?.quantity || 0,
        }),
      );

      setCardsWithQuantity(withQuantity);

      // Calculate rarity totals
      const totals = withQuantity.reduce(
        (acc, card) => {
          const rarity = card.rarity.toLowerCase() || 'common';
          if (!acc[rarity]) {
            acc[rarity] = 0;
          }
          acc[rarity] += card.quantity || 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      setRarityTotals(totals);
    };

    loadCards();
  }, [decklist]);

  const handleQuantityChange = useCallback(
    (card: CardWithQuantity, change: 1 | -1) => {
      const currentQuantity = card.quantity || 0;
      const newQuantity = Math.min(4, Math.max(1, currentQuantity + change));

      // Only start the transition if the new quantity is valid
      if (newQuantity !== currentQuantity) {
        startTransition(async () => {
          try {
            await updateCardQuantity(deckId, card.cardId, board, change);

            // Optimistically update the UI
            setCardsWithQuantity((prev) =>
              prev.map((c) => {
                if (c.cardId === card.cardId) {
                  return { ...c, quantity: newQuantity };
                }
                return c;
              }),
            );

            // Update rarity totals
            setRarityTotals((prev) => {
              const rarity = card.rarity.toLowerCase() || 'common';
              const newTotal = Math.min(
                4,
                Math.max(1, (prev[rarity] || 0) + change),
              );
              return { ...prev, [rarity]: newTotal };
            });
          } catch (error) {
            toast.error('Failed to update card quantity', {
              description:
                error instanceof Error ? error.message : 'An error occurred',
            });
          }
        });
      }
    },
    [deckId],
  );

  function QuantityButton({
    card,
    sign,
    className,
  }: {
    card: CardWithQuantity;
    sign: string;
    className?: string;
  }) {
    // Don't render minus button if quantity is 1, or plus button if quantity is 4
    if (
      (sign === '-' && card.quantity === 1) ||
      (sign === '+' && card.quantity === 4)
    ) {
      return null;
    }

    return (
      <span
        className={cn(
          'absolute top-1 z-10 flex h-5 px-2 cursor-pointer items-center justify-center rounded-full bg-yellow-500/90 text-xl text-black opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110',
          sign === '-' ? 'left-1' : 'right-1',
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleQuantityChange(card, sign === '+' ? 1 : -1);
        }}
      >
        {sign === '-' ? (
          <p className="text-xs flex items-center">
            <Minus className="size-3" strokeWidth={3} />1
          </p>
        ) : (
          <p className="text-xs flex items-center">
            <Plus className="size-3" strokeWidth={3} />1
          </p>
        )}
      </span>
    );
  }

  return (
    <>
      <div className="right-0 mb-4 flex items-center gap-4">
        <p className="flex items-center gap-1 text-sm md:text-base">
          <Image
            src="/images/rarities/common.png"
            alt="Common"
            width={32}
            height={32}
            className="size-6 md:size-8"
          />
          {rarityTotals.common || 0}
        </p>
        <p className="flex items-center gap-1 text-xs md:text-base">
          <Image
            src="/images/rarities/uncommon.png"
            alt="Uncommon"
            width={32}
            height={32}
            className="size-6 md:size-8"
          />
          {rarityTotals.uncommon || 0}
        </p>
        <p className="flex items-center gap-1 text-sm md:text-base">
          <Image
            src="/images/rarities/rare.png"
            alt="Rare"
            width={32}
            height={32}
            className="size-6 md:size-8"
          />
          {rarityTotals.rare || 0}
        </p>
        <p className="flex items-center gap-1 text-sm md:text-base">
          <Image
            src="/images/rarities/mythic.png"
            alt="Mythic"
            width={32}
            height={32}
            className="size-6 md:size-8"
          />
          {rarityTotals.mythic || 0}
        </p>
      </div>

      <div className="mx-auto mt-2 gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {cardsWithQuantity?.map((card: CardWithQuantity) => (
          <div key={card.id} className="group relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <QuantityButton card={card} sign="+" />
              <QuantityButton card={card} sign="-" />
            </div>
            <Card
              card={card}
              collectedQuantity={
                collectedCards?.find((c) => c.name === card.name)?.quantity || 0
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}
