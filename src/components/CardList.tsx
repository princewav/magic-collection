'use client';

import { useCards } from '@/context/CardsContext';
import { useCollection } from '@/context/CollectionContext';
import { CardWithQuantity, CardWithOptionalQuantity } from '@/types/card';
import { useEffect, useRef, useCallback, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useCardModal } from '@/context/CardModalContext';
import Image from 'next/image';
import { ManaSymbol } from './ManaSymbol';
import { Search } from 'lucide-react';

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
  } = useCollection();
  const { openModal } = useCardModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Determine if we're using server-loaded data via initialCards
  const isServerLoaded = Boolean(initialCards && initialCards.length > 0);

  const cards = collectionType
    ? collectedCardsFromContext
    : generalCardsFromContext;
  const isLoading = isServerLoaded
    ? false
    : collectionType
      ? collectionLoadingFromContext
      : generalLoadingFromContext;
  const total = collectionType
    ? collectionTotalFromContext
    : generalTotalFromContext;
  const loadNextPage = collectionType
    ? loadNextCollectionPageFromContext
    : loadNextGeneralPageFromContext;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading && cards.length < total) {
        loadNextPage();
      }
    },
    [isLoading, loadNextPage, cards.length, total],
  );

  useEffect(() => {
    if (!isMounted) return;

    const options = {
      root: null,
      rootMargin: '20px',
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

  // Add empty state handling similar to CardGrid
  const showEmptyState = !isServerLoaded && cards.length === 0 && !isLoading;

  return (
    <div className="relative">
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Search className="text-muted-foreground/70 h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No cards found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Try adjusting your search filters or removing some constraints to
            see more results.
          </p>
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
              {cards.map((card, index) => (
                <tr
                  key={`${card.id}-${index}`}
                  onClick={() => openModal(card, cards)}
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
      <div ref={loadingRef} className="h-10 w-full">
        {isLoading && !isServerLoaded && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}
