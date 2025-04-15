'use client';

import { Wishlist } from '@/types/wishlist';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Grid2X2, List, Target, RotateCcw } from 'lucide-react';
import { useCardModal } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import { groupCardsByType } from '@/lib/deck/utils';
import { CardWithQuantity } from '@/types/card';
import { WishlistGridCard } from './WishlistGridCard';
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
  const [isGridView, setIsGridView] = useState(true);
  const [showTrackedCounters, setShowTrackedCounters] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [groupedCards, setGroupedCards] = useState<
    Record<string, CardWithQuantity[]>
  >({});
  const { openModal } = useCardModal();

  useEffect(() => {
    const savedLayout = localStorage.getItem('wishlistLayout');
    if (savedLayout) {
      setIsGridView(savedLayout === 'grid');
    }
  }, []);

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

  const toggleLayout = () => {
    const newLayout = !isGridView;
    setIsGridView(newLayout);
    localStorage.setItem('wishlistLayout', newLayout ? 'grid' : 'list');
    return 0;
  };

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
    console.log(`Remove card ${cardId} from wishlist ${wishlistId}`);
    // TODO: Implement actual card removal logic here
    // This will likely involve updating the wishlist state/data
    // and potentially making an API call.
    // No need to close context menu here anymore, it closes automatically.

    // Call the server action
    toast.promise(removeCardFromWishlist(wishlistId, cardId), {
      loading: 'Removing card...',
      success: (result) => {
        // Optional: Check result.message for cases like 'Card not found' if needed
        return 'Card removed from wishlist.';
      },
      error: (err) => {
        // err should be the { success: false, message: ... } object from the action
        return err.message || 'Failed to remove card.';
      },
    });
  };

  // Define the within-group sorting function using totalPrice and name as tie-breaker
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
          {!isGridView && (
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
          )}
          {!isGridView && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetCounters}
              className="h-8 w-8"
              title="Reset tracked quantities"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleLayout}
          className="h-8 w-8"
          title={isGridView ? 'Switch to list view' : 'Switch to grid view'}
        >
          {isGridView ? (
            <List className="h-4 w-4" />
          ) : (
            <Grid2X2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isGridView ? (
        <div data-role="grid-view" className="space-y-6 px-6 sm:px-0">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => {
            // Sort cards within the group by total price
            const sortedCardsInGroup = [...cardsInGroup].sort(sortByTotalPrice);
            return (
              <div data-role="grid-group" key={groupName}>
                <h2
                  data-role="group-title"
                  className="mb-3 text-lg font-semibold capitalize"
                >
                  {capitalize(groupName)} (
                  {cardsInGroup.reduce(
                    (sum, card) => sum + (card.quantity || 0),
                    0,
                  )}
                  )
                </h2>
                <div
                  data-role="card-grid"
                  className="relative justify-start gap-4 sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(200px,250px))] sm:space-y-0"
                >
                  {sortedCardsInGroup.map((card) => (
                    <WishlistGridCard
                      key={card.cardId}
                      card={card}
                      onClick={() => openModal(card, wishlist.cards)}
                      wishlistId={wishlist.id}
                      onRemoveCard={handleRemoveCard}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div data-role="list-view" className="lg:columns-2 lg:gap-x-4">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => {
            // Sort cards within the group by total price
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
      )}
      <CardModal />
    </div>
  );
};
