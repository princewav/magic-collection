'use client';

import { useSettings } from '@/context/SettingsContext';
import { CardGrid } from './CardGrid';
import { CardList } from './CardList';

interface CardViewProps {
  collectionType?: 'paper' | 'arena';
}

export function CardView({ collectionType }: CardViewProps) {
  const { layout } = useSettings();

  return layout === 'grid' ? (
    <CardGrid collectionType={collectionType} />
  ) : (
    <CardList collectionType={collectionType} />
  );
}
