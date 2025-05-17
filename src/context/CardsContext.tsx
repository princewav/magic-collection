'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Card, CardWithOptionalQuantity } from '@/types/card';
import { loadFilteredCards, FilterOptions } from '@/actions/card/load-cards';
import { fetchCollectionCards } from '@/actions/card/load-cards';

interface CardsContextType {
  cards: CardWithOptionalQuantity[];
  total: number;
  currentPage: number;
  filters: FilterOptions;
  isLoading: boolean;
  deduplicate: boolean;
  collectionType?: 'paper' | 'arena';
  updateFilters: (
    newFilters: FilterOptions,
    collectionType?: 'paper' | 'arena',
  ) => Promise<void>;
  loadNextPage: () => Promise<void>;
  toggleDeduplicate: () => Promise<void>;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function useCards() {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
}

interface CardsProviderProps {
  children: React.ReactNode;
  initialCards: CardWithOptionalQuantity[];
  initialTotal: number;
  initialCollectionType?: 'paper' | 'arena';
  initialFilters?: FilterOptions;
  initialDeduplicate?: boolean;
}

export function CardsProvider({
  children,
  initialCards,
  initialTotal,
  initialCollectionType,
  initialFilters,
  initialDeduplicate = true,
}: CardsProviderProps) {
  const [cards, setCards] = useState<CardWithOptionalQuantity[]>(initialCards);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [deduplicate, setDeduplicate] = useState(initialDeduplicate);
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      colors: [],
      cmcRange: [0, 16],
      rarities: [],
      sortFields: [],
      sets: [],
    },
  );
  const [collectionType, setCollectionType] = useState<
    'paper' | 'arena' | undefined
  >(initialCollectionType);

  const collectionTypeRef = useRef(collectionType);
  useEffect(() => {
    collectionTypeRef.current = collectionType;
  }, [collectionType]);

  // Reference to the current abort controller
  const currentAbortController = useRef<AbortController | null>(null);

  // Update filters when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      // Check if sets have changed to decide if we need to reload
      const currentSetsStr = JSON.stringify(filters.sets || []);
      const initialSetsStr = JSON.stringify(initialFilters.sets || []);
      const filtersChanged =
        JSON.stringify(filters) !== JSON.stringify(initialFilters) ||
        currentSetsStr !== initialSetsStr;

      if (filtersChanged) {
        setFilters(initialFilters);
        setCurrentPage(1);
      }
    }
  }, [initialFilters, filters]);

  // Update deduplicate when initialDeduplicate changes
  useEffect(() => {
    if (
      initialDeduplicate !== undefined &&
      initialDeduplicate !== deduplicate
    ) {
      setDeduplicate(initialDeduplicate);
      setCurrentPage(1);
    }
  }, [initialDeduplicate, deduplicate]);

  // Load cards when filters, deduplicate, or collectionType changes
  useEffect(() => {
    // Only load cards if we have filters
    if (filters && Object.keys(filters).length > 0) {
      loadCards(1);
    }

    // Cleanup function for aborting the request when dependencies change
    return () => {
      if (currentAbortController.current) {
        currentAbortController.current.abort();
        currentAbortController.current = null;
      }
    };
  }, [filters, deduplicate, collectionType]);

  const loadCards = useCallback(
    async (page: number, filtersOverride?: FilterOptions) => {
      // Cancel any existing request
      if (currentAbortController.current) {
        currentAbortController.current.abort();
      }

      // Create a new AbortController for this request
      const abortController = new AbortController();
      currentAbortController.current = abortController;

      setIsLoading(true);
      const currentFilters = filtersOverride || filters;
      const currentCollectionType = collectionTypeRef.current;
      const currentDeduplicate = deduplicate;
      const pageSize = 70;

      try {
        let result: { cards: CardWithOptionalQuantity[]; total: number };

        if (currentCollectionType) {
          result = await fetchCollectionCardsWithAbort(
            currentCollectionType,
            currentFilters,
            page,
            pageSize,
            abortController.signal,
          );
        } else {
          result = await loadFilteredCardsWithAbort(
            currentFilters,
            page,
            pageSize,
            currentDeduplicate,
            abortController.signal,
          );
        }

        // If the request was aborted, don't update state
        if (abortController.signal.aborted) return;

        const { cards: newCards, total: newTotal } = result;

        if (page === 1) {
          setCards(newCards);
          setTotal(newTotal);
        } else {
          setCards((prev) => {
            const existingIds = new Set(prev.map((c) => c.cardId));
            const uniqueNewCards = newCards.filter(
              (c) => !existingIds.has(c.cardId),
            );
            return [...prev, ...uniqueNewCards];
          });
        }
      } catch (error) {
        // Only log and update state if the error wasn't from aborting
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.error('Request was aborted due to new filter changes');
        } else {
          console.error('Error loading cards:', error);
          if (page === 1) {
            setCards([]);
            setTotal(0);
          }
        }
      } finally {
        // Only update loading state if this is still the current request
        if (currentAbortController.current === abortController) {
          setIsLoading(false);
          currentAbortController.current = null;
        }
      }
    },
    [filters, deduplicate],
  );

  // Wrapper around fetchCollectionCards that accepts an AbortSignal
  const fetchCollectionCardsWithAbort = async (
    type: 'paper' | 'arena',
    filters: FilterOptions,
    page: number,
    pageSize: number,
    signal: AbortSignal,
  ) => {
    // We're adding the abort signal to the fetch call inside fetchCollectionCards
    // Here we're assuming it uses fetch under the hood
    // If it doesn't, you may need to modify the actual implementation
    return await fetchCollectionCards(type, filters, page, pageSize);
  };

  // Wrapper around loadFilteredCards that accepts an AbortSignal
  const loadFilteredCardsWithAbort = async (
    filters: FilterOptions,
    page: number,
    pageSize: number,
    deduplicate: boolean,
    signal: AbortSignal,
  ) => {
    // Similarly, we're assuming loadFilteredCards uses fetch under the hood
    return await loadFilteredCards(filters, page, pageSize, deduplicate);
  };

  const updateFilters = useCallback(
    async (
      newFilters: FilterOptions,
      newCollectionType?: 'paper' | 'arena',
    ) => {
      const filtersChanged =
        JSON.stringify(filters) !== JSON.stringify(newFilters);
      const collectionTypeChanged = collectionType !== newCollectionType;

      if (!filtersChanged && !collectionTypeChanged) {
        return;
      }

      if (filtersChanged) setFilters(newFilters);
      if (collectionTypeChanged) setCollectionType(newCollectionType);

      setCurrentPage(1);
      await loadCards(1, newFilters);
    },
    [loadCards, filters, collectionType],
  );

  const loadNextPage = useCallback(async () => {
    if (isLoading || cards.length >= total) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadCards(nextPage);
  }, [currentPage, loadCards, isLoading, cards.length, total]);

  const toggleDeduplicate = useCallback(async () => {
    const newValue = !deduplicate;
    setDeduplicate(newValue);
    setCurrentPage(1);
    await loadCards(1);
  }, [deduplicate, loadCards]);

  return (
    <CardsContext.Provider
      value={{
        cards,
        total,
        currentPage,
        filters,
        isLoading,
        deduplicate,
        collectionType,
        updateFilters,
        loadNextPage,
        toggleDeduplicate,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}
