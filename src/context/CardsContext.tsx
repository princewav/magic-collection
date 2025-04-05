'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Card } from '@/types/card';
import { loadFilteredCards, FilterOptions } from '@/actions/card/load-cards';
import { STANDARD_SETS } from '@/lib/constants';

interface CardsContextType {
  cards: Card[];
  total: number;
  currentPage: number;
  filters: FilterOptions;
  isLoading: boolean;
  deduplicate: boolean;
  updateFilters: (newFilters: FilterOptions) => Promise<void>;
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
  initialCards: Card[];
  initialTotal: number;
}

export function CardsProvider({
  children,
  initialCards,
  initialTotal,
}: CardsProviderProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [deduplicate, setDeduplicate] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    colors: [],
    cmcRange: [0, 10],
    rarities: [],
    sortFields: [],
    sets: STANDARD_SETS,
  });

  const loadCards = useCallback(
    async (page: number, newFilters?: FilterOptions) => {
      setIsLoading(true);
      try {
        const filtersToUse = newFilters || filters;
        const { cards: newCards, total: newTotal } = await loadFilteredCards(
          filtersToUse,
          page,
          70, // pageSize
          deduplicate,
        );

        if (page === 1) {
          setCards(newCards);
          setTotal(newTotal);
        } else {
          setCards((prev) => [...prev, ...newCards]);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, deduplicate],
  );

  const updateFilters = useCallback(
    async (newFilters: FilterOptions) => {
      setFilters(newFilters);
      setCurrentPage(1);
      await loadCards(1, newFilters);
    },
    [loadCards],
  );

  const loadNextPage = useCallback(async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadCards(nextPage);
  }, [currentPage, loadCards]);

  const toggleDeduplicate = useCallback(async () => {
    const newValue = !deduplicate;
    setDeduplicate(newValue);
    // Reload first page with new deduplicate value
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
        updateFilters,
        loadNextPage,
        toggleDeduplicate,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}
