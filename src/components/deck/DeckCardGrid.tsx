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
import { Deck } from '@/types/deck';
import { sortBy } from '@/lib/sortingUtils';

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

    // Use the new sortBy utility
    const sortFunction = sortBy(['cmc', 'color', 'name']);
    const sortedCards = [...decklist].sort(sortFunction);

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
              <div className="w-full">
                {' '}
                {/* Or appropriate width context */}
                {/* This is the container for your cards */}
                <div className="flex flex-wrap justify-center gap-3">
                  {cardsInGroup.map((card: CardWithQuantity) => (
                    // Each card item
                    // Choose a width that fits your card and is within your original minmax(200px, 250px) range.
                    // For example, w-56 (224px), w-60 (240px), or w-[250px].
                    <div
                      key={card.id}
                      className="group relative w-[240px]" // Example fixed width for flex items
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
                        className="w-full hover:scale-105" // Card component takes full width of its w-[240px] parent
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div data-role="list-view" className="lg:columns-2 lg:gap-x-4">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => (
            <div
              key={groupName}
              className="mb-3 break-inside-avoid"
              data-role="list-group-wrapper"
            >
              <h2 className="text-md mb-1 text-center font-semibold capitalize">
                {capitalize(groupName)} (
                {cardsInGroup.reduce(
                  (sum, card) => sum + (card.quantity || 0),
                  0,
                )}
                )
              </h2>
              <div data-role="card-list">
                {cardsInGroup.map((card) => (
                  <div
                    key={card.id}
                    className="bg-card group hover:bg-secondary/10 mb-2 flex cursor-pointer items-center justify-between overflow-x-auto rounded-lg border p-2 shadow-sm"
                    onClick={() => openModal(card, cardsWithQuantity)}
                  >
                    <div className="flex w-full items-center gap-3">
                      {/* Quantity & Image & Collected */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                          {card.quantity}x
                        </div>
                        {card.image_uris?.art_crop ? (
                          <Image
                            src={card.image_uris.art_crop}
                            alt=""
                            width={40}
                            height={40}
                            className="size-7 rounded-sm object-cover sm:size-9"
                          />
                        ) : card.card_faces &&
                          card.card_faces[0].image_uris?.art_crop ? (
                          <Image
                            src={card.card_faces[0].image_uris.art_crop}
                            alt=""
                            width={40}
                            height={40}
                            className="size-7 rounded-sm object-cover sm:size-9"
                          />
                        ) : null}
                      </div>
                      {/* Main Content Area */}
                      <div className="ml-2 flex w-full gap-2 truncate sm:flex-col sm:gap-0">
                        {/* Row 1: Name */}
                        <div>
                          <span className="min-w-0 flex-1">
                            {(card.layout === 'reversible_card' ||
                              card.layout === 'modal_dfc' ||
                              card.layout === 'transform') &&
                            card.card_faces
                              ? `${card.card_faces[0].name} // ${card.card_faces[1]?.name || ''}`
                              : card.name}
                          </span>
                        </div>
                        {/* Row 2: Set + Mana */}
                        <div className="flex w-full items-center justify-between gap-2 sm:justify-start">
                          <span className="text-muted-foreground inline-block font-mono text-sm">
                            [{card.set.toUpperCase()}]
                          </span>
                          {card.mana_cost && (
                            <p className="flex items-center">
                              <TextWithSymbols
                                text={card.mana_cost}
                                symbolSize={16}
                                symbolClassName="mx-0.5"
                              />
                            </p>
                          )}
                          {!card.mana_cost &&
                            card.card_faces &&
                            card.card_faces[0].mana_cost && (
                              <p className="flex items-center">
                                <TextWithSymbols
                                  text={card.card_faces[0].mana_cost}
                                  symbolSize={16}
                                  symbolClassName="mx-0.5"
                                />
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Right side: Type Line & P/T */}
                    <div className="ml-4 hidden flex-col items-end text-right sm:flex">
                      <span className="text-muted-foreground min-w-0 truncate text-xs">
                        {card.type_line
                          ? card.type_line.split(' — ')[0]
                          : card.card_faces && card.card_faces[0].type_line
                            ? card.card_faces[0].type_line.split(' — ')[0]
                            : ''}
                      </span>
                      {/* Combined second type line part and P/T */}
                      {(card.type_line?.includes(' — ') ||
                        (card.card_faces &&
                          card.card_faces[0].type_line?.includes(' — ')) ||
                        (card.power != null && card.toughness != null) ||
                        (card.card_faces &&
                          card.card_faces[0].power != null &&
                          card.card_faces[0].toughness != null)) && (
                        <span className="text-muted-foreground/60 min-w-0 truncate text-xs">
                          {card.type_line?.includes(' — ')
                            ? card.type_line?.split(' — ')[1]
                            : card.card_faces &&
                                card.card_faces[0].type_line?.includes(' — ')
                              ? card.card_faces[0].type_line?.split(' — ')[1]
                              : ''}
                          {(card.type_line?.includes(' — ') ||
                            (card.card_faces &&
                              card.card_faces[0].type_line?.includes(' — '))) &&
                            ((card.power != null && card.toughness != null) ||
                              (card.card_faces &&
                                card.card_faces[0].power != null &&
                                card.card_faces[0].toughness != null)) &&
                            ' - '}
                          {card.power != null && card.toughness != null ? (
                            <span className="font-semibold">
                              {card.power}/{card.toughness}
                            </span>
                          ) : card.card_faces &&
                            card.card_faces[0].power != null &&
                            card.card_faces[0].toughness != null ? (
                            <span className="font-semibold">
                              {card.card_faces[0].power}/
                              {card.card_faces[0].toughness}
                            </span>
                          ) : null}
                        </span>
                      )}
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
