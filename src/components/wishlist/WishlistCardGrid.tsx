'use client';

import { Wishlist } from '@/types/wishlist';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, RotateCcw } from 'lucide-react';
import { useCardModal } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import { groupCardsByType } from '@/lib/deck/utils';
import { CardWithQuantity } from '@/types/card';
import { WishlistListCard } from './WishlistListCard';
import {
  TrackedQuantityCounter,
  getLocalStorageKey,
} from './TrackedQuantityCounter';
import { capitalize, cn } from '@/lib/utils';
import { sortBy } from '@/lib/sortingUtils';
import { removeCardFromWishlist } from '@/actions/wishlist/remove-card-from-wishlist';
import { toast } from 'sonner';

interface Props {
  wishlist: Wishlist;
}

export const WishlistCardGrid = ({ wishlist }: Props) => {
  const [showTrackedCounters, setShowTrackedCounters] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [groupedCards, setGroupedCards] = useState<
    Record<string, CardWithQuantity[]>
  >({});
  const { openModal } = useCardModal();

  useEffect(() => {
    if (wishlist?.cards) {
      const sortFunction = sortBy(['landsLast', 'cmc', 'color', 'name']);
      const sortedCards = [...wishlist.cards].sort(sortFunction);

      const groups = groupCardsByType(sortedCards);
      setGroupedCards(groups);
    } else {
      setGroupedCards({});
    }
  }, [wishlist]);

  const handleResetCounters = () => {
    if (typeof window !== 'undefined' && wishlist && wishlist.cards) {
      wishlist.cards.forEach((card) => {
        const key = getLocalStorageKey(wishlist.id, card.cardId);
        localStorage.removeItem(key);
        console.log('Removed key:', key);
      });
      setResetTrigger((prev) => prev + 1);
    }
  };

  const handleRemoveCard = (wishlistId: string, cardId: string) => {
    toast.promise(removeCardFromWishlist(wishlistId, cardId), {
      loading: 'Removing card...',
      success: (result) => {
        return 'Card removed from wishlist.';
      },
      error: (err) => {
        return err.message || 'Failed to remove card.';
      },
    });
  };

  const sortByTotalPrice = sortBy(['totalPrice']);

  if (!wishlist.cards || wishlist.cards.length === 0) {
    return (
      <div
        data-role="empty-state"
        className="flex h-64 items-center justify-center rounded-lg border border-dashed"
      >
        <p data-role="empty-text" className="text-muted-foreground">
          No cards in this wishlist
        </p>
      </div>
    );
  }

  return (
    <div data-role="container" className="space-y-4">
      <div
        data-role="layout-toggle-wrapper"
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTrackedCounters((prev) => !prev)}
            className="h-8 w-8"
            title={
              showTrackedCounters
                ? 'Hide tracked counters'
                : 'Show tracked counters'
            }
          >
            <Target
              className={`h-4 w-4 ${showTrackedCounters ? 'text-primary' : ''}`}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetCounters}
            className="h-8 w-8"
            title="Reset tracked quantities"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div data-role="list-view" className="lg:columns-2 lg:gap-x-4">
        {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => {
          const sortedCardsInGroup = [...cardsInGroup].sort(sortByTotalPrice);
          return (
            <div
              key={groupName}
              className="mb-3 break-inside-avoid space-y-2"
              data-role="list-group-wrapper"
            >
              <h2
                data-role="group-title"
                className="text-md mb-1 font-semibold capitalize"
              >
                {capitalize(groupName)} (
                {cardsInGroup.reduce(
                  (sum, card) => sum + (card.quantity || 0),
                  0,
                )}
                )
              </h2>
              {sortedCardsInGroup.map((card) => (
                <div
                  key={card.cardId}
                  className="flex items-center gap-3"
                  data-role="list-item-wrapper"
                >
                  <div
                    className={cn(
                      'w-16 flex-shrink-0',
                      !showTrackedCounters && 'hidden',
                    )}
                  >
                    <TrackedQuantityCounter
                      key={`${card.cardId}-${resetTrigger}`}
                      wishlistId={wishlist.id}
                      cardId={card.cardId}
                      targetQuantity={card.quantity}
                    />
                  </div>
                  <WishlistListCard
                    card={card}
                    onClick={() => openModal(card, wishlist.cards)}
                    wishlistId={wishlist.id}
                    onRemoveCard={handleRemoveCard}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <CardModal />
    </div>
  );
};
