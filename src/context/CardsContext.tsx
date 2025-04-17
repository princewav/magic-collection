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
import { fetchCollectionCards } from '@/actions/load-cards';


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
}

export function CardsProvider({
  children,
  initialCards,
  initialTotal,
  initialCollectionType,
}: CardsProviderProps) {
  const [cards, setCards] = useState<CardWithOptionalQuantity[]>(initialCards);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [deduplicate, setDeduplicate] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    colors: [],
    cmcRange: [0, 16],
    rarities: [],
    sortFields: [],
    sets: [],
    exactColorMatch: false,
  });
  const [collectionType, setCollectionType] = useState<
    'paper' | 'arena' | undefined
  >(initialCollectionType);

  const collectionTypeRef = useRef(collectionType);
  useEffect(() => {
    collectionTypeRef.current = collectionType;
  }, [collectionType]);

  const loadCards = useCallback(
    async (page: number, filtersOverride?: FilterOptions) => {
      setIsLoading(true);
      const currentFilters = filtersOverride || filters;
      const currentCollectionType = collectionTypeRef.current;
      const currentDeduplicate = deduplicate;
      const pageSize = 70;

      try {
        let result: { cards: CardWithOptionalQuantity[]; total: number };

        if (currentCollectionType) {
          result = await fetchCollectionCards(
            currentCollectionType,
            currentFilters,
            page,
            pageSize,
          );
        } else {
          result = await loadFilteredCards(
            currentFilters,
            page,
            pageSize,
            currentDeduplicate,
          );
        }

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
        console.error('Error loading cards:', error);
        if (page === 1) {
          setCards([]);
          setTotal(0);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters, deduplicate],
  );

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
