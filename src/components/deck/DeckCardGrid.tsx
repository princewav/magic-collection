'use client';

import { updateCardQuantity } from '@/actions/deck/update-card-quantity';
import { TextWithSymbols } from '@/components/card-modal/TextWithSymbols';
import { useCardModal } from '@/context/CardModalContext';
import { calculateRarityTotals, groupCardsByType } from '@/lib/deck/utils';
import { cn } from '@/lib/utils';
import { CardWithQuantity } from '@/types/card';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card } from '../Card';

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
  const [groupedCards, setGroupedCards] = useState<
    Record<string, CardWithQuantity[]>
  >({});
  const [rarityTotals, setRarityTotals] = useState<Record<string, number>>({});
  const { openModal } = useCardModal();

  useEffect(() => {
    if (!decklist) return;

    // Sort the cards with quantity
    const sortedCards = [...decklist].sort((a, b) => {
      // Then by CMC
      if (a.cmc !== b.cmc) return a.cmc - b.cmc;
      // Then by color
      const colorA = (a.colors || []).join('');
      const colorB = (b.colors || []).join('');
      if (colorA !== colorB) return colorA.localeCompare(colorB);

      // Finally by name
      return a.name.localeCompare(b.name);
    });

    setCardsWithQuantity(sortedCards);

    // Group the sorted cards by type
    const groups = groupCardsByType(sortedCards);
    setGroupedCards(groups);

    // Calculate rarity totals using the original sorted list
    const totals = calculateRarityTotals(sortedCards);
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

            // Optimistically update the UI and totals
            setCardsWithQuantity((prev) => {
              const updatedCards = prev.map((c) => {
                if (c.cardId === card.cardId) {
                  return { ...c, quantity: newQuantity };
                }
                return c;
              });
              // Recalculate totals and groups based on the *new* card list
              const newTotals = calculateRarityTotals(updatedCards);
              setRarityTotals(newTotals);
              const newGroups = groupCardsByType(updatedCards); // Regroup cards
              setGroupedCards(newGroups); // Update grouped state
              return updatedCards; // Return the updated list for state
            });

            // No need for the separate setRarityTotals block anymore
            // toast.success('Card quantity updated'); // Optional success toast
          } catch (error) {
            toast.error('Failed to update card quantity', {
              description:
                error instanceof Error ? error.message : 'An error occurred',
            });
            // Revert optimistic update on error? Maybe not needed if the source data is refetched.
          }
        });
      }
    },
    [deckId, board], // Added board dependency
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

  // Helper to capitalize the first letter of a string
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
        <div className="space-y-6 px-6 sm:px-0">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => (
            <div key={groupName}>
              <h2 className="text-md mb-3 text-center font-semibold capitalize">
                {capitalize(groupName)} (
                {cardsInGroup.reduce(
                  (sum, card) => sum + (card.quantity || 0),
                  0,
                )}
                )
              </h2>
              <div className="relative justify-center gap-4 sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(200px,250px))] sm:space-y-0">
                {cardsInGroup.map((card: CardWithQuantity) => (
                  <div
                    key={card.id}
                    className="group relative mb-4 sm:mb-0"
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
                        collectedCards?.find((c) => c.name === card.name)
                          ?.quantity || 0
                      }
                      className="mx-auto w-full max-w-[320px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => (
            <div key={groupName}>
              <h2 className="text-md mb-2 text-center font-semibold capitalize">
                {capitalize(groupName)} (
                {cardsInGroup.reduce(
                  (sum, card) => sum + (card.quantity || 0),
                  0,
                )}
                )
              </h2>
              <div className="space-y-2">
                {cardsInGroup.map((card) => (
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
                        {card.image_uris?.art_crop && (
                          <Image
                            src={card.image_uris.art_crop}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-sm object-cover"
                          />
                        )}
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
                            symbolSize={18}
                            symbolClassName="mx-0.5"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          CMC: {card.cmc}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
