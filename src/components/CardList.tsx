'use client';

import { useCards } from '@/context/CardsContext';
import { useCollection } from '@/context/CollectionContext';
import { CardWithQuantity, CardWithOptionalQuantity } from '@/types/card';
import { useEffect, useRef, useCallback, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useCardModal } from '@/context/CardModalContext';
import Image from 'next/image';
import { ManaSymbol } from './ManaSymbol';
import { Search, XCircle } from 'lucide-react';

interface CardListProps {
  collectionType: 'paper' | 'arena' | undefined;
  initialCards?: CardWithOptionalQuantity[];
  initialTotal?: number;
}

export function CardList({
  collectionType,
  initialCards,
  initialTotal,
}: CardListProps) {
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

  // Function to render mana cost symbols
  const renderManaCost = (manaCost: string) => {
    if (!manaCost) return null;

    // Extract mana symbols from string like "{W}{U}{B}{R}{G}"
    const symbols = manaCost.match(/{([^}]+)}/g) || [];

    return (
      <div className="flex items-center gap-1">
        {symbols.map((symbol, index) => {
          const manaSymbol = symbol.replace(/{|}/g, '');
          return <ManaSymbol key={index} symbol={manaSymbol} />;
        })}
      </div>
    );
  };

  // Determine if we're showing an empty state
  const showEmptyState =
    localDisplayCards.length === 0 && !localDisplayIsLoading;
  // Check if we have any active filters
  const hasActiveFilters = Object.values(currentFilters).some(
    (value) => value && (Array.isArray(value) ? value.length > 0 : true),
  );

  // Debug logging
  console.log('CardList Debug:', {
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
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left align-middle">Name</th>
                <th className="hidden p-2 text-left align-middle lg:table-cell">
                  Set
                </th>
                <th className="hidden p-2 text-left align-middle lg:table-cell">
                  Type
                </th>
                <th className="p-2 text-left align-middle">Mana Cost</th>
                <th className="p-2 text-left align-middle">Rarity</th>
                {collectionType && (
                  <th className="p-2 text-right align-middle">Quantity</th>
                )}
              </tr>
            </thead>
            <tbody>
              {localDisplayCards.map((card, index) => (
                <tr
                  key={`${card.id}-${index}`}
                  onClick={() => openModal(card, localDisplayCards)}
                  className="hover:bg-secondary/20 cursor-pointer border-b transition-colors"
                >
                  <td className="flex items-center gap-2 p-2 align-middle">
                    {card.image_uris && (
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={card.image_uris.small}
                          alt={card.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="align-middle">{card.name}</span>
                  </td>
                  <td className="hidden p-2 align-middle lg:table-cell">
                    {card.set_name}
                  </td>
                  <td className="hidden p-2 align-middle lg:table-cell">
                    {card.type_line}
                  </td>
                  <td className="p-2 align-middle">
                    {renderManaCost(card.mana_cost)}
                  </td>
                  <td className="p-2 align-middle capitalize">{card.rarity}</td>
                  {collectionType && (
                    <td className="p-2 text-right align-middle">
                      {(card as CardWithQuantity).quantity || 0}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
