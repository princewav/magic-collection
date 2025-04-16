'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Card } from '@/types/card';
import { fetchCollectionCards } from '@/actions/load-cards';
import { FilterOptions } from '@/actions/card/load-cards';

interface CollectionContextType {
  collectedCards: (Card & { quantity: number })[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  loadNextPage: () => void;
  applyFilter: (filterOptions: FilterOptions) => void;
  currentFilters: FilterOptions;
  collectionType?: 'paper' | 'arena';
}

const CollectionContext = createContext<CollectionContextType | undefined>(
  undefined,
);

interface CollectionProviderProps {
  children: ReactNode;
  collectionType: 'paper' | 'arena';
}

export function CollectionProvider({
  children,
  collectionType,
}: CollectionProviderProps) {
  const [collectedCards, setCollectedCards] = useState<
    (Card & { quantity: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    colors: [],
    cmcRange: [0, 16],
    rarities: [],
    sortFields: [],
    sets: [],
    exactColorMatch: false,
  });

  console.log('[CollectionContext] State:', {
    collectedCards: collectedCards.length,
    isLoading,
    error,
    page,
    total,
    currentFilters,
    collectionType,
  });

  const fetchCollectedCards = useCallback(
    async (pageNum = 1) => {
      console.log('[CollectionContext] Fetching cards:', {
        pageNum,
        currentFilters,
        collectionType,
      });
      setIsLoading(true);
      try {
        const { cards, total } = await fetchCollectionCards(
          collectionType,
          currentFilters,
          pageNum,
        );

        console.log('[CollectionContext] Fetched data:', {
          cards: cards.length,
          total,
        });

        if (pageNum === 1) {
          setCollectedCards(cards);
        } else {
          setCollectedCards((prev) => [...prev, ...cards]);
        }

        setTotal(total);
      } catch (err) {
        console.error('[CollectionContext] Error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        if (pageNum === 1) {
          setCollectedCards([]);
          setTotal(0);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters, collectionType],
  );

  // Initial load
  useEffect(() => {
    console.log('[CollectionContext] Initial load');
    fetchCollectedCards(1);
  }, [fetchCollectedCards]);

  const loadNextPage = useCallback(() => {
    console.log('[CollectionContext] Loading next page:', page + 1);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCollectedCards(nextPage);
  }, [page, fetchCollectedCards]);

  const applyFilter = useCallback((filterOptions: FilterOptions) => {
    console.log('[CollectionContext] Applying filters:', filterOptions);
    setCurrentFilters(filterOptions);
    setPage(1);
    // Filters will be applied on the next fetchCollectedCards call triggered by the useEffect
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        collectedCards,
        isLoading,
        error,
        total,
        loadNextPage,
        applyFilter,
        currentFilters,
        collectionType,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);

  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }

  return context;
}
