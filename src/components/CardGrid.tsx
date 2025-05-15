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
  } = useCollection();
  const { openModal } = useCardModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const cards = collectionType
    ? collectedCardsFromContext
    : generalCardsFromContext;
  const isLoading = collectionType
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

  return (
    <div className="relative">
      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="w-72 sm:w-[min(100%,275px)]"
          >
            <div
              onClick={() => openModal(card, cards)}
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
      <div ref={loadingRef} className="h-10 w-full">
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}
