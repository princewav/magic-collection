'use client';

import { useCards } from '@/context/CardsContext';
import { useCollection } from '@/context/CollectionContext';
import { Card as CardType, CardWithQuantity, CardWithOptionalQuantity } from '@/types/card';
import { Card } from './Card';
import { useEffect, useRef, useCallback, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useCardModal } from '@/context/CardModalContext';

export function CardGrid({
  collectionType,
}: {
  collectionType: 'paper' | 'arena' | undefined;
}) {
  const {
    cards: generalCards,
    isLoading: generalLoading,
    loadNextPage: loadNextGeneralPage,
    total: generalTotal,
  } = useCards();
  const {
    collectedCards,
    isLoading: collectionLoading,
    loadNextPage: loadNextCollectionPage,
    total: collectionTotal,
  } = useCollection();
  const { openModal } = useCardModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const cards = collectionType ? collectedCards : generalCards;
  const isLoading = collectionType ? collectionLoading : generalLoading;
  const total = collectionType ? collectionTotal : generalTotal;
  const loadNextPage = collectionType
    ? loadNextCollectionPage
    : loadNextGeneralPage;

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
            className="w-full sm:w-[min(100%,350px)] md:w-[min(100%,300px)] lg:w-[min(100%,280px)]"
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
