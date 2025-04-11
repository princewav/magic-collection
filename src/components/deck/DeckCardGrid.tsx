'use client';

import { loadCardsById } from '@/actions/load-cards';
import { Card as CardType } from '@/types/card';
import { defaultSort } from '@/lib/deck/sorting';
import Image from 'next/image';
import { Card } from '../Card';
import { CardWithQuantity } from '@/types/card';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  useRef,
  useMemo,
} from 'react';
import { updateCardQuantity } from '@/actions/deck/update-card-quantity';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';
import { useCardModal } from '@/context/CardModalContext';
import { Button } from '@/components/ui/button';
import { ManaSymbol } from '@/components/ManaSymbol';
import { TextWithSymbols } from '@/components/card-modal/TextWithSymbols';

interface Props {
  decklist?: CardWithQuantity[];
  collectedCards?: { name: string; quantity: number }[];
  type: 'paper' | 'arena';
  board: 'maindeck' | 'sideboard';
  isGridView: boolean;
}

export function DeckCardGrid({
  decklist,
  collectedCards,
  type,
  board,
  isGridView,
}: Props) {
  const params = useParams();
  const deckId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [cardsWithQuantity, setCardsWithQuantity] = useState<
    CardWithQuantity[]
  >([]);
  const [rarityTotals, setRarityTotals] = useState<Record<string, number>>({});
  const { openModal } = useCardModal();

  const cardIds = useMemo(() => {
    if (!decklist) return [];
    return decklist.map((card) => card.cardId).filter(Boolean) || [];
  }, [decklist]);

  useEffect(() => {
    if (!decklist) return;

    // Sort the cards with quantity
    const sortedCards = [...decklist].sort((a, b) => {
      // First sort by type (lands last)
      const isLandA = a.type_line?.toLowerCase().includes('land') || false;
      const isLandB = b.type_line?.toLowerCase().includes('land') || false;
      if (isLandA !== isLandB) return isLandA ? 1 : -1;

      // Then by color
      const colorA = (a.colors || []).join('');
      const colorB = (b.colors || []).join('');
      if (colorA !== colorB) return colorA.localeCompare(colorB);

      // Then by CMC
      if (a.cmc !== b.cmc) return a.cmc - b.cmc;

      // Finally by name
      return a.name.localeCompare(b.name);
    });

    setCardsWithQuantity(sortedCards);

    // Calculate rarity totals
    const totals = sortedCards.reduce(
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
          'absolute top-1 z-10 flex h-5 cursor-pointer items-center justify-center rounded-full bg-yellow-500/90 px-2 text-xl text-black opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110',
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
          <p className="flex items-center text-xs">
            <Minus className="size-3" strokeWidth={3} />1
          </p>
        ) : (
          <p className="flex items-center text-xs">
            <Plus className="size-3" strokeWidth={3} />1
          </p>
        )}
      </span>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
      </div>

      {isGridView ? (
        <div className="relative justify-center gap-4 space-y-4 px-6 sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(200px,250px))] sm:space-y-0 sm:px-0">
          {cardsWithQuantity?.map((card: CardWithQuantity) => (
            <div
              key={card.id}
              className="group relative"
              onClick={() => openModal(card, cardsWithQuantity)}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <QuantityButton card={card} sign="+" />
                <QuantityButton card={card} sign="-" />
              </div>
              <Card
                card={card}
                collectedQuantity={
                  collectedCards?.find((c) => c.name === card.name)?.quantity ||
                  0
                }
                className="mx-auto w-full max-w-[320px]"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {cardsWithQuantity?.map((card) => (
            <div
              key={card.id}
              className="bg-card group hover:bg-accent/5 flex cursor-pointer items-center justify-between rounded-lg border p-3 shadow-sm"
              onClick={() => openModal(card, cardsWithQuantity)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-background/80 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                    {card.quantity}x
                  </div>
                  {collectedCards?.find((c) => c.name === card.name)
                    ?.quantity ? (
                    <div className="bg-accent h-2 w-2 rotate-45 transform" />
                  ) : null}
                </div>
                <span className="font-medium">{card.name}</span>
                <span className="text-muted-foreground text-sm">
                  [{card.set.toUpperCase()}]
                </span>
              </div>
              <div className="flex items-center gap-4">
                {card.mana_cost && (
                  <div className="flex items-center">
                    <TextWithSymbols
                      text={card.mana_cost}
                      symbolSize={16}
                      symbolClassName="mx-0.5"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    CMC: {card.cmc}
                  </span>
                  {card.colors?.map((color) => (
                    <ManaSymbol key={color} symbol={color} size={16} />
                  ))}
                </div>
                <div
                  className="flex items-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <QuantityButton
                    card={card}
                    sign="-"
                    className="relative opacity-100 hover:scale-110"
                  />
                  <QuantityButton
                    card={card}
                    sign="+"
                    className="relative opacity-100 hover:scale-110"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
