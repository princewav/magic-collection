'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/types/card';
import { CollectionCardGrid } from './CollectionCardGrid';
import { useCards } from '@/context/CardsContext';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  initialCards: (Card & { quantity: number })[];
}

const CARDS_PER_PAGE = 50;

export function CollectionWrapper({ initialCards }: Props) {
  // Use the card context to get filter states
  const { filters } = useCards();

  // Need a separate state for text search since it's not part of the main filters
  const [searchText, setSearchText] = useState('');

  // Get collected cards that match the current filters
  const [filteredCards, setFilteredCards] = useState(initialCards);

  // Cards currently displayed (will grow as user scrolls)
  const [displayedCards, setDisplayedCards] = useState<
    (Card & { quantity: number })[]
  >([]);

  // Track loading state
  const [isLoading, setIsLoading] = useState(false);

  // Reference to loading element that will trigger more cards to load
  const loadingRef = useRef<HTMLDivElement>(null);

  // Observer to detect when user scrolls to loading element
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Apply filters from the main Filters component to our collection cards
  useEffect(() => {
    let result = [...initialCards];

    // Apply color filters if any
    if (filters.colors && filters.colors.length > 0) {
      if (filters.exactColorMatch) {
        // Exact color match: card must have exactly these colors and no others
        result = result.filter((card) => {
          const cardColors = card.colors || [];
          return (
            cardColors.length === filters.colors?.length &&
            filters.colors?.every((color) => cardColors.includes(color))
          );
        });
      } else {
        // Card must have at least one of the selected colors
        result = result.filter((card) => {
          const cardColors = card.colors || [];
          return (
            filters.colors?.some((color) => cardColors.includes(color)) || false
          );
        });
      }
    }

    // Apply CMC filter
    if (filters.cmcRange) {
      const [min, max] = filters.cmcRange;
      result = result.filter((card) => card.cmc >= min && card.cmc <= max);
    }

    // Apply rarity filter
    if (filters.rarities && filters.rarities.length > 0) {
      result = result.filter(
        (card) => filters.rarities?.includes(card.rarity) || false,
      );
    }

    // Apply set filter
    if (filters.sets && filters.sets.length > 0) {
      result = result.filter(
        (card) => filters.sets?.includes(card.set.toLowerCase()) || false,
      );
    }

    // Apply text search if any
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(searchLower) ||
          card.oracle_text?.toLowerCase().includes(searchLower),
      );
    }

    // Only show cards with quantity > 0 (collected cards)
    result = result.filter((card) => card.quantity > 0);

    setFilteredCards(result);

    // Reset displayed cards when filters change
    // Only show first batch of cards initially
    setDisplayedCards(result.slice(0, CARDS_PER_PAGE));
  }, [filters, initialCards, searchText]);

  // Load more cards when user scrolls to the bottom
  const loadMoreCards = useCallback(() => {
    if (isLoading || displayedCards.length >= filteredCards.length) return;

    setIsLoading(true);

    // Simulate loading delay to show spinner
    setTimeout(() => {
      const nextBatch = filteredCards.slice(
        displayedCards.length,
        displayedCards.length + CARDS_PER_PAGE,
      );

      setDisplayedCards((prev) => [...prev, ...nextBatch]);
      setIsLoading(false);
    }, 300);
  }, [displayedCards.length, filteredCards, isLoading]);

  // Set up intersection observer for infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isLoading &&
        displayedCards.length < filteredCards.length
      ) {
        loadMoreCards();
      }
    },
    [isLoading, loadMoreCards, displayedCards.length, filteredCards.length],
  );

  // Set up intersection observer
  useEffect(() => {
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
  }, [handleObserver]);

  // Inline minimal search input above the collection grid
  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search in collection..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full max-w-md rounded border p-2"
        />
      </div>

      <CollectionCardGrid
        cards={displayedCards}
        isLoading={false}
        total={filteredCards.length}
      />

      {/* Loading indicator for infinite scroll */}
      <div ref={loadingRef} className="h-20 w-full">
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Display card count info */}
      <div className="mt-2 text-center text-sm text-gray-500">
        Showing {displayedCards.length} of {filteredCards.length} cards
      </div>
    </>
  );
}
