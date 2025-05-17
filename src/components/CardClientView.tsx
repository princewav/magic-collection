'use client';

import { useSettings } from '@/context/SettingsContext';
import { CardGrid } from './CardGrid';
import { CardList } from './CardList';
import { CardWithOptionalQuantity } from '@/types/card';
import { useEffect, useState } from 'react';

interface CardClientViewProps {
  cardsData: {
    cards: CardWithOptionalQuantity[];
    total: number;
  };
  collectionType?: 'paper' | 'arena';
}

export function CardClientView({
  cardsData,
  collectionType,
}: CardClientViewProps) {
  const { layout } = useSettings();
  const [isReady, setIsReady] = useState(false);

  // Small delay to ensure smooth transition from skeleton to content
  useEffect(() => {
    // Immediate state update when we have data
    if (cardsData?.cards?.length > 0) {
      setIsReady(true);
    }
  }, [cardsData]);

  // Ensure we have data before rendering
  if (!isReady && !cardsData?.cards?.length) {
    return null;
  }

  return layout === 'grid' ? (
    <CardGrid
      initialCards={cardsData.cards}
      initialTotal={cardsData.total}
      collectionType={collectionType}
    />
  ) : (
    <CardList
      initialCards={cardsData.cards}
      initialTotal={cardsData.total}
      collectionType={collectionType}
    />
  );
}
