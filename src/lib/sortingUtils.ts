import { CardWithQuantity } from '@/types/card';

type CardComparator = (a: CardWithQuantity, b: CardWithQuantity) => number;

// --- Individual Comparison Strategies ---

const compareByLandStatus: CardComparator = (a, b) => {
  const isLandA = a.type_line?.toLowerCase().includes('land') ?? false;
  const isLandB = b.type_line?.toLowerCase().includes('land') ?? false;
  if (isLandA === isLandB) return 0;
  return isLandA ? 1 : -1; // Lands sort last
};

const compareByCmc: CardComparator = (a, b) => {
  return (a.cmc ?? 0) - (b.cmc ?? 0);
};

const compareByColor: CardComparator = (a, b) => {
  // Sort by WUBRG order, then colorless, then multicolor
  const colorOrder = { W: 1, U: 2, B: 3, R: 4, G: 5 };
  const getColorScore = (colors: string[] | null | undefined): number => {
    if (!colors || colors.length === 0) return 6; // Colorless after WUBRG
    if (colors.length > 1) return 7; // Multicolor last
    return colorOrder[colors[0] as keyof typeof colorOrder] ?? 6;
  };

  const scoreA = getColorScore(a.colors);
  const scoreB = getColorScore(b.colors);

  if (scoreA !== scoreB) return scoreA - scoreB;

  // For multicolor, sort alphabetically as a tiebreaker
  if (scoreA === 7) {
    const colorStringA = (a.colors || []).sort().join('');
    const colorStringB = (b.colors || []).sort().join('');
    return colorStringA.localeCompare(colorStringB);
  }

  return 0; // Same color category
};

const compareByName: CardComparator = (a, b) => {
  return a.name.localeCompare(b.name);
};

const compareByTotalPrice: CardComparator = (a, b) => {
  const priceA = parseFloat(a.prices?.eur ?? '0') || 0;
  const priceB = parseFloat(b.prices?.eur ?? '0') || 0;
  const totalPriceA = (a.quantity ?? 1) * priceA;
  const totalPriceB = (b.quantity ?? 1) * priceB;
  return totalPriceB - totalPriceA; // Descending order
};

// --- Strategy Map ---

const sortingStrategies: Record<string, CardComparator> = {
  landsLast: compareByLandStatus,
  cmc: compareByCmc,
  color: compareByColor,
  name: compareByName,
  totalPrice: compareByTotalPrice,
  // Add other strategies like 'price' here if the data is available
  // price: compareByPrice,
};

// --- SortBy Function ---

export const sortBy = (strategyNames: (keyof typeof sortingStrategies)[]) => {
  const comparators = strategyNames.map((name) => {
    const comparator = sortingStrategies[name];
    if (!comparator) {
      console.warn(`Unknown sorting strategy: ${name}`);
      return () => 0; // Return a no-op comparator if strategy is unknown
    }
    return comparator;
  });

  // Add name sort as a final tie-breaker if not already included
  if (!strategyNames.includes('name')) {
    comparators.push(compareByName);
  }

  return (a: CardWithQuantity, b: CardWithQuantity): number => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
};
