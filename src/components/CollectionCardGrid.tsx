'use client';

import { Card as CardType } from '@/types/card';
import { Card } from './Card';
import { useEffect, useRef, useCallback, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useCardModal } from '@/context/CardModalContext';

interface Props {
  cards?: (CardType & { quantity: number })[];
  isLoading?: boolean;
  loadNextPage?: () => void;
  total?: number;
}

export function CollectionCardGrid({
  cards = [],
  isLoading = false,
  loadNextPage,
  total = 0,
}: Props) {
  const { openModal } = useCardModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isLoading &&
        loadNextPage &&
        cards.length < total
      ) {
        loadNextPage();
      }
    },
    [isLoading, loadNextPage, cards.length, total],
  );

  useEffect(() => {
    if (!loadNextPage) return; // Don't set up observer if we don't have pagination

    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, loadNextPage]);

  if (!cards.length && !isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-gray-500">No collected cards found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="w-full sm:w-[min(100%,350px)] md:w-[min(100%,300px)] lg:w-[min(100%,280px)]"
          >
            <div onClick={() => openModal(card, cards)}>
              <Card
                key={card.id}
                card={card}
                collectedQuantity={card.quantity}
              />
            </div>
          </div>
        ))}
      </div>
      {loadNextPage && (
        <div ref={loadingRef} className="h-10 w-full">
          {isLoading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
