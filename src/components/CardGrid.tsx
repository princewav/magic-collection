'use client';

import { useCards } from '@/context/CardsContext';
import { useCollection } from '@/context/CollectionContext';
import {
  Card as CardType,
  CardWithQuantity,
  CardWithOptionalQuantity,
} from '@/types/card';
import { Card } from './Card';
import { useEffect, useRef, useCallback, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useCardModal } from '@/context/CardModalContext';
import { Search, XCircle } from 'lucide-react';

interface CardGridProps {
  collectionType: 'paper' | 'arena' | undefined;
  initialCards?: CardWithOptionalQuantity[];
  initialTotal?: number;
}

export function CardGrid({
  collectionType,
  initialCards,
  initialTotal,
}: CardGridProps) {
  const {
    cards: generalCardsFromContext,
    isLoading: generalLoadingFromContext,
    loadNextPage: loadNextGeneralPageFromContext,
    total: generalTotalFromContext,
  } = useCards();
  const {
    collectedCards: collectedCardsFromContext,
    isLoading: collectionLoadingFromContext,
    loadNextPage: loadNextCollectionPageFromContext,
    total: collectionTotalFromContext,
    currentFilters,
  } = useCollection();
  const { openModal } = useCardModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const hasInitialServerData = typeof initialCards !== 'undefined';

  let localDisplayCards: CardWithOptionalQuantity[];
  let localDisplayTotal: number;
  let localDisplayIsLoading: boolean;

  if (hasInitialServerData) {
    localDisplayCards = initialCards!;
    localDisplayTotal = initialTotal!;
    localDisplayIsLoading = false;
  } else {
    if (collectionType) {
      localDisplayCards = collectedCardsFromContext;
      localDisplayTotal = collectionTotalFromContext;
      localDisplayIsLoading = collectionLoadingFromContext;
    } else {
      localDisplayCards = generalCardsFromContext;
      localDisplayTotal = generalTotalFromContext;
      localDisplayIsLoading = generalLoadingFromContext;
    }
  }

  const contextIsLoading = collectionType
    ? collectionLoadingFromContext
    : generalLoadingFromContext;
  const contextLoadNextPage = collectionType
    ? loadNextCollectionPageFromContext
    : loadNextGeneralPageFromContext;

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      setIsIntersecting(target.isIntersecting);

      if (
        target.isIntersecting &&
        !contextIsLoading &&
        localDisplayCards.length < localDisplayTotal
      ) {
        // Use a small delay to prevent multiple triggers
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }

        loadingTimerRef.current = setTimeout(() => {
          contextLoadNextPage();
        }, 150);
      }
    },
    [
      contextIsLoading,
      contextLoadNextPage,
      localDisplayCards.length,
      localDisplayTotal,
      setIsIntersecting,
    ],
  );

  // Re-attempt loading when the loading state changes or cards array changes
  useEffect(() => {
    if (
      isIntersecting &&
      !contextIsLoading &&
      localDisplayCards.length < localDisplayTotal
    ) {
      // Try loading more after loading state changes
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }

      loadingTimerRef.current = setTimeout(() => {
        contextLoadNextPage();
      }, 150);
    }
  }, [
    contextIsLoading,
    localDisplayCards.length,
    localDisplayTotal,
    isIntersecting,
    contextLoadNextPage,
  ]);

  useEffect(() => {
    if (!isMounted) return;

    const options = {
      root: null,
      rootMargin: '100px', // Increased from 20px to 100px for earlier detection
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observerRef.current.observe(currentLoadingRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, isMounted]);

  if (!isMounted) {
    return null;
  }

  // Determine if we're showing an empty state
  const showEmptyState =
    localDisplayCards.length === 0 && !localDisplayIsLoading;
  // Check if we have any active filters
  const hasActiveFilters = Object.values(currentFilters).some(
    (value) => value && (Array.isArray(value) ? value.length > 0 : true),
  );

  // Debug logging
  console.log('CardGrid Debug:', {
    hasInitialServerData,
    initialCardsLength: initialCards?.length,
    initialTotal,
    cardsLength: localDisplayCards.length,
    isLoading: localDisplayIsLoading,
    contextIsLoading,
    showEmptyState,
    hasActiveFilters,
    currentFilters,
    collectionType,
    total: localDisplayTotal,
    collectedCardsFromContext: collectedCardsFromContext.length,
    generalCardsFromContext: generalCardsFromContext.length,
  });

  return (
    <div className="relative">
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Search className="text-muted-foreground/70 h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {hasActiveFilters ? 'No cards found' : 'Your collection is empty'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {hasActiveFilters
              ? 'Try adjusting your search filters or removing some constraints to see more results.'
              : 'Start building your collection by adding cards from the search page.'}
          </p>
          {hasActiveFilters && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4" />
              <span>Filters may be too restrictive</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {localDisplayCards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="w-72 sm:w-[min(100%,275px)]"
            >
              <div
                onClick={() => openModal(card, localDisplayCards)}
                className="h-full cursor-pointer"
              >
                {card.quantity !== undefined ? (
                  <Card
                    card={card as CardWithQuantity}
                    collectedQuantity={card.quantity || 0}
                  />
                ) : (
                  <Card card={{ ...card, quantity: 0 }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div ref={loadingRef} className="h-20 w-full">
        {contextIsLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}
