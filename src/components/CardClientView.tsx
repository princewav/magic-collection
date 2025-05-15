'use client';

import { useSettings } from '@/context/SettingsContext';
import { CardGrid } from './CardGrid';
import { CardList } from './CardList';
import { CardWithOptionalQuantity } from '@/types/card';

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
