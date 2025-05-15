'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { Card } from '@/types/card';
import { fetchCollectionCards } from '@/actions/card/load-cards';
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
  initialFilters?: FilterOptions;
}

export function CollectionProvider({
  children,
  collectionType,
  initialFilters,
}: CollectionProviderProps) {
  const [collectedCards, setCollectedCards] = useState<
    (Card & { quantity: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>(
    initialFilters || {
      colors: [],
      cmcRange: [0, 16],
      rarities: [],
      sortFields: [],
      sets: [],
      exactColorMatch: false,
    },
  );

  // Reference to the current abort controller
  const currentAbortController = useRef<AbortController | null>(null);

  // Update filters when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      setCurrentFilters(initialFilters);
      setPage(1);
    }
  }, [initialFilters]);

  const fetchCollectedCards = useCallback(
    async (pageNum = 1) => {
      // Cancel any existing request
      if (currentAbortController.current) {
        currentAbortController.current.abort();
      }

      // Create a new AbortController for this request
      const abortController = new AbortController();
      currentAbortController.current = abortController;

      setIsLoading(true);
      try {
        const { cards, total } = await fetchCollectionCards(
          collectionType,
          currentFilters,
          pageNum,
        );

        // If request was aborted, don't update state
        if (abortController.signal.aborted) return;

        if (pageNum === 1) {
          setCollectedCards(cards);
        } else {
          setCollectedCards((prev) => [...prev, ...cards]);
        }

        setTotal(total);
      } catch (err) {
        // Only log and update state if the error wasn't from aborting
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('Request was aborted due to new filter changes');
        } else {
          console.error('[CollectionContext] Error:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          if (pageNum === 1) {
            setCollectedCards([]);
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
    [currentFilters, collectionType],
  );

  // Fetch cards when filters change
  useEffect(() => {
    fetchCollectedCards(1);

    // Cleanup function for aborting the request when dependencies change
    return () => {
      if (currentAbortController.current) {
        currentAbortController.current.abort();
        currentAbortController.current = null;
      }
    };
  }, [currentFilters, collectionType, fetchCollectedCards]);

  const loadNextPage = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCollectedCards(nextPage);
  }, [page, fetchCollectedCards]);

  const applyFilter = useCallback((filterOptions: FilterOptions) => {
    setCurrentFilters(filterOptions);
    setPage(1);
    // Filters will be applied by the useEffect when currentFilters changes
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
