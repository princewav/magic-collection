'use client';

import { useEffect, useRef } from 'react';
import { CardGrid } from '@/components/CardGrid';
import { useCards } from '@/context/CardsContext';

interface CardContainerProps {
  filters: any;
  page: number;
  pageSize: number;
  deduplicate: boolean;
  collectionType?: 'paper' | 'arena';
}

function deepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function CardContainer({
  filters,
  page,
  pageSize,
  deduplicate,
  collectionType,
}: CardContainerProps) {
  const {
    updateFilters,
    filters: ctxFilters,
    collectionType: ctxCollectionType,
  } = useCards();
  const prev = useRef<{ filters: any; collectionType?: string }>({
    filters: ctxFilters,
    collectionType: ctxCollectionType,
  });

  useEffect(() => {
    const filtersChanged = !deepEqual(filters, prev.current.filters);
    const collectionTypeChanged =
      collectionType !== prev.current.collectionType;
    if (filtersChanged || collectionTypeChanged) {
      updateFilters(filters, collectionType);
      prev.current = { filters, collectionType };
    }
  }, [filters, collectionType, updateFilters]);

  return <CardGrid collectionType={collectionType}/>;
}
