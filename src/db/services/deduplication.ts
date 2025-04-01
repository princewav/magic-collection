import { Card, Rarity, Layout } from '@/types/card';

// Constants for scoring logic
const SCORE_CONFIG = {
  RARITY: {
    BONUS: 10,
    SPECIAL: 0,
    COMMON: 50,
    UNCOMMON: 40,
    RARE: 30,
    MYTHIC: 20,
    DEFAULT: 0,
  },
  LAYOUT: {
    NORMAL: 30,
    SPLIT: 10,
    FLIP: 10,
    TRANSFORM: 10,
    MODAL_DFC: 10,
    DEFAULT: 0,
  },
  RARITY_TYPE: {
    NON_SPECIAL_BONUS: 100, // Bonus for not being 'bonus' or 'special'
  },
  COLLECTOR_NUMBER: {
    MAX: 10000, // Assumed max collector number for scoring inversion
    DIVISOR: 100,
    DEFAULT_NUMERIC: 9999, // Default if parsing fails
  },
  RELEASE_DATE: {
    DIVISOR: 10000000000, // Normalization factor
  },
};

const ACCEPTED_NON_NORMAL_LAYOUTS = [
  Layout.SPLIT,
  Layout.FLIP,
  Layout.TRANSFORM,
  Layout.MODAL_DFC,
];

export class CardDeduplicationService {
  /**
   * Calculates a "normality" score for a card based on various factors.
   * Higher scores indicate a more "standard" or preferred version.
   */
  private getCardNormalityScore(card: Card): number {
    let score = 0;
    const rarity = card.rarity as Rarity;
    const layout = card.layout as Layout;

    // Prefer non-special rarities
    if (![Rarity.BONUS, Rarity.SPECIAL].includes(rarity)) {
      score += SCORE_CONFIG.RARITY_TYPE.NON_SPECIAL_BONUS;
    }

    // Prefer lower standard rarities
    score +=
      SCORE_CONFIG.RARITY[
        rarity.toUpperCase() as keyof typeof SCORE_CONFIG.RARITY
      ] ?? SCORE_CONFIG.RARITY.DEFAULT;

    // Prefer normal layouts, then other accepted layouts
    if (layout === Layout.NORMAL) {
      score += SCORE_CONFIG.LAYOUT.NORMAL;
    } else if (ACCEPTED_NON_NORMAL_LAYOUTS.includes(layout)) {
      score += SCORE_CONFIG.LAYOUT.DEFAULT; // Or assign specific scores if needed later
    }

    // Prefer lowest collector number (original printing in a set)
    const collectorNumber = card.collector_number || '';
    const numericPart = parseInt(
      collectorNumber.match(/^\d+/)?.[0] ||
        SCORE_CONFIG.COLLECTOR_NUMBER.DEFAULT_NUMERIC.toString(),
      10,
    );
    // Invert the value so lower numbers score higher
    score +=
      (SCORE_CONFIG.COLLECTOR_NUMBER.MAX - numericPart) /
      SCORE_CONFIG.COLLECTOR_NUMBER.DIVISOR;

    // Prefer more recent sets (better artwork/templating)
    // Handle potential invalid date strings gracefully
    const releaseDate = new Date(card.released_at);
    if (!isNaN(releaseDate.getTime())) {
      score += releaseDate.getTime() / SCORE_CONFIG.RELEASE_DATE.DIVISOR;
    }

    return score;
  }

  /**
   * Deduplicates a list of cards, keeping only one card with each unique name.
   * Prioritizes the most "normal" version based on the scoring logic.
   */
  public deduplicateCardsByName(cards: Card[]): Card[] {
    const uniqueCards = new Map<string, Card>();

    for (const card of cards) {
      // Skip cards without a name, although this shouldn't typically happen
      if (!card.name) continue;

      const currentBestCard = uniqueCards.get(card.name);
      const currentCardScore = this.getCardNormalityScore(card);

      if (
        !currentBestCard ||
        currentCardScore > this.getCardNormalityScore(currentBestCard)
      ) {
        uniqueCards.set(card.name, card);
      }
    }

    return Array.from(uniqueCards.values());
  }
}

// Optional: Export a singleton instance if preferred across the application
// export const cardDeduplicationService = new CardDeduplicationService();
