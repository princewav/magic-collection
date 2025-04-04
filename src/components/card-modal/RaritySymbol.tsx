'use client';
import { cn } from '@/lib/utils';
import React from 'react';

interface RaritySymbolProps {
  card: { rarity: string };
}

const rarityStyles: Record<string, string> = {
  common:
    'border border-gray-500 bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700 dark:border-0',
  uncommon: 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black',
  rare: 'bg-gradient-to-br from-amber-300 to-amber-500 text-black',
  mythic: 'bg-gradient-to-br from-orange-400 to-orange-600 text-black',
};

export function RaritySymbol({ card }: RaritySymbolProps) {
  const { rarity } = card;
  const style = rarityStyles[rarity] || rarityStyles.mythic;

  const rarityTitles: Record<string, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    mythic: 'Mythic Rare',
  };

  return (
    <span
      className="flex size-6 items-center justify-center rounded-full transition-all md:size-7"
      title={rarityTitles[rarity] || rarityTitles.mythic}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full',
          'text-sm font-bold shadow-sm md:text-base',
          style,
        )}
      >
        {rarity.charAt(0).toUpperCase()}
      </span>
    </span>
  );
}
