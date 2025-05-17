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
    // Set isReady to true if cardsData is available,
    // indicating that the data fetching process has completed.
    if (typeof cardsData !== 'undefined') {
      setIsReady(true);
    }

    // Debug logging
    console.log('CardClientView Debug:', {
      hasCardsData: Boolean(cardsData),
      cardsLength: cardsData?.cards?.length,
      total: cardsData?.total,
      isReady,
      collectionType,
    });
  }, [cardsData]); // зависимости isReady и collectionType удалены, т.к. не влияют на установку isReady

  // Ensure we have data before rendering
  if (!isReady) {
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
