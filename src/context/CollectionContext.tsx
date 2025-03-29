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

interface CollectionContextType {
  collectedCards: (Card & { quantity: number })[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  loadNextPage: () => void;
  applyFilter: (filterOptions: FilterOptions) => void;
  currentFilters: FilterOptions;
}

interface FilterOptions {
  search?: string;
  set?: string;
  rarity?: string;
}

const CollectionContext = createContext<CollectionContextType | undefined>(
  undefined,
);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collectedCards, setCollectedCards] = useState<
    (Card & { quantity: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});

  const fetchCollectedCards = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await fetch(
          `/api/collection?page=${pageNum}&${new URLSearchParams(currentFilters as Record<string, string>)}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch collection');
        }

        const data = await response.json();

        if (pageNum === 1) {
          setCollectedCards(data.cards);
        } else {
          setCollectedCards((prev) => [...prev, ...data.cards]);
        }

        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters],
  );

  // Initial load
  useEffect(() => {
    fetchCollectedCards(1);
  }, [fetchCollectedCards]);

  const loadNextPage = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCollectedCards(nextPage);
  }, [page, fetchCollectedCards]);

  const applyFilter = useCallback((filterOptions: FilterOptions) => {
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
