'use client';

import { useEffect } from 'react';
import { CardGrid } from '@/components/CardGrid';
import { useCards } from '@/context/CardsContext';

interface CardContainerProps {
  filters: any;
  page: number;
  pageSize: number;
  deduplicate: boolean;
}

export function CardContainer({
  filters,
  page,
  pageSize,
  deduplicate,
}: CardContainerProps) {
  const { updateFilters } = useCards();

  useEffect(() => {
    // Update filters and load initial data when component mounts
    updateFilters(filters);
  }, [filters, updateFilters]);

  return <CardGrid />;
}
