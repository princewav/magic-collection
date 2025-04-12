import { CardWithQuantity } from '@/types/card';

export function calculateRarityTotals(
  cards: CardWithQuantity[],
): Record<string, number> {
  if (!cards || cards.length === 0) {
    return {};
  }
  return cards.reduce(
    (acc, card) => {
      const rarity = card.rarity?.toLowerCase() || 'common'; // Ensure rarity exists and default
      if (!acc[rarity]) {
        acc[rarity] = 0;
      }
      // Ensure quantity exists and default to 1 if not present
      acc[rarity] += card.quantity ?? 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}
