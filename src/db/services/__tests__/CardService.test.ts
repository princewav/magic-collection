import { CardService } from '../CardService';
import { Rarity } from '@/types/card';
import { CardDeduplicationService } from '../deduplication';
import { CardFilteringService } from '../CardFilteringService';

describe('CardService', () => {
  let cardService: CardService;

  beforeAll(async () => {
    cardService = new CardService(
      new CardDeduplicationService(),
      new CardFilteringService(),
    );
  });

  describe('getByNameAndSet', () => {
    it('should find a real card by name and set', async () => {
      const result = await cardService.getByNameAndSet('Lightning Bolt', 'lea');
      expect(result).toBeTruthy();
      expect(result[0]?.name).toBe('Lightning Bolt');
      expect(result[0]?.set).toBe('lea');
    });
  });

  describe('getFilteredCardsWithPagination', () => {
    it('should return filtered and paginated cards', async () => {
      const filters = {
        colors: ['R'],
        rarities: ['rare'],
        cmcRange: [2, 4] as [number, number],
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const { cards, total } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        10,
      );

      expect(cards).toBeInstanceOf(Array);
      expect(total).toBeGreaterThan(0);
      expect(cards.length).toBeLessThanOrEqual(10);
    });

    it('should filter by multiple colors', async () => {
      const filters = {
        colors: ['R', 'B'],
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        10,
      );

      cards.forEach((card) => {
        const hasAtLeastOneColor = card.colors.some((color) =>
          ['R', 'B'].includes(color),
        );
        expect(hasAtLeastOneColor).toBe(true);
      });
    });

    it('should filter by CMC range', async () => {
      const filters = {
        cmcRange: [3, 5] as [number, number],
        sortFields: [{ field: 'cmc', order: 'asc' as const }],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        10,
      );

      cards.forEach((card) => {
        expect(card.cmc).toBeGreaterThanOrEqual(3);
        expect(card.cmc).toBeLessThanOrEqual(5);
      });
    });

    it('should filter by multiple rarities', async () => {
      const filters = {
        rarities: ['rare', 'mythic'],
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        10,
      );

      cards.forEach((card) => {
        expect(['rare', 'mythic']).toContain(card.rarity);
      });
    });

    it('should sort by multiple fields', async () => {
      const filters = {
        sortFields: [
          { field: 'cmc', order: 'asc' as const },
          { field: 'name', order: 'asc' as const },
        ],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        10,
      );

      // Check if cards are sorted by CMC first
      for (let i = 1; i < cards.length; i++) {
        if (cards[i].cmc !== cards[i - 1].cmc) {
          expect(cards[i].cmc).toBeGreaterThanOrEqual(cards[i - 1].cmc);
        } else {
          // If CMC is equal, check name sorting
          expect(
            cards[i].name.localeCompare(cards[i - 1].name),
          ).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should handle descending sort order', async () => {
      const filters = {
        sortFields: [{ field: 'cmc', order: 'desc' as const }],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        10,
      );

      for (let i = 1; i < cards.length; i++) {
        expect(cards[i].cmc).toBeLessThanOrEqual(cards[i - 1].cmc);
      }
    });

    it('should handle pagination correctly', async () => {
      const filters = {
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const page1 = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        5,
        false,
      );

      const page2 = await cardService.getFilteredCardsWithPagination(
        filters,
        2,
        5,
        false,
      );

      expect(page1.cards.length).toBeLessThanOrEqual(5);
      expect(page2.cards.length).toBeLessThanOrEqual(5);
      expect(page1.total).toBe(page2.total);
      expect(page1.cards[0].name).not.toBe(page2.cards[0].name);
    });

    it('should sort cards by rarity in correct order', async () => {
      const filters = {
        sortFields: [{ field: 'rarity', order: 'asc' as const }],
      };

      console.log('Starting rarity sort test (asc)');
      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        100000,
      );
      console.log(`Retrieved ${cards.length} cards for rarity test`);

      // Print the first 10 cards to see the sorting
      cards.slice(0, 10).forEach((card) => {
        console.log(`Card: ${card.name}, Rarity: ${card.rarity}`);
      });

      // Get unique rarities in order
      const rarities = [...new Set(cards.map((card) => card.rarity))];
      console.log('Unique rarities in order:', rarities);

      // Verify the order
      expect(rarities).toEqual([
        Rarity.BONUS,
        Rarity.COMMON,
        Rarity.UNCOMMON,
        Rarity.RARE,
        Rarity.MYTHIC,
      ]);

      // Test descending order
      const descFilters = {
        sortFields: [{ field: 'rarity', order: 'desc' as const }],
      };

      console.log('Starting rarity sort test (desc)');
      const { cards: descCards } =
        await cardService.getFilteredCardsWithPagination(descFilters, 1, 100);
      console.log(`Retrieved ${descCards.length} cards for rarity desc test`);

      // Print the first 10 cards to see the sorting
      descCards.slice(0, 10).forEach((card) => {
        console.log(`Card: ${card.name}, Rarity: ${card.rarity}`);
      });

      // Get unique rarities in order for descending
      const descRarities = [...new Set(descCards.map((card) => card.rarity))];
      console.log('Unique rarities in order (desc):', descRarities);

      // Verify the descending order
      expect(descRarities).toEqual([
        'mythic',
        'rare',
        'uncommon',
        'common',
        'bonus',
      ]);
    });

    it('should sort cards by colors in correct order', async () => {
      const filters = {
        sortFields: [{ field: 'colors', order: 'asc' as const }],
      };

      console.log('Starting color sort test (asc)');
      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        100,
      );
      console.log(`Retrieved ${cards.length} cards for color test`);

      // Print the first 10 cards to see the sorting
      cards.slice(0, 10).forEach((card) => {
        console.log(
          `Card: ${card.name}, Colors: [${card.colors.join(',')}], Category: ${card.colors.length === 0 ? 'C' : card.colors.length > 1 ? 'M' : card.colors[0]}`,
        );
      });

      // Get unique color combinations in order
      const colorCombos = [
        ...new Set(
          cards.map((card) => {
            if (card.colors.length === 0) return 'C';
            if (card.colors.length > 1) return 'M';
            return card.colors[0];
          }),
        ),
      ];
      console.log('Unique color combinations in order:', colorCombos);

      // Verify the order
      expect(colorCombos).toEqual(['W', 'U', 'B', 'R', 'G', 'M', 'C']);

      // Test descending order
      const descFilters = {
        sortFields: [{ field: 'colors', order: 'desc' as const }],
      };

      console.log('Starting color sort test (desc)');
      const { cards: descCards } =
        await cardService.getFilteredCardsWithPagination(descFilters, 1, 100);
      console.log(`Retrieved ${descCards.length} cards for color desc test`);

      // Print the first 10 cards to see the sorting
      descCards.slice(0, 10).forEach((card) => {
        console.log(
          `Card: ${card.name}, Colors: [${card.colors.join(',')}], Category: ${card.colors.length === 0 ? 'C' : card.colors.length > 1 ? 'M' : card.colors[0]}`,
        );
      });

      // Get unique color combinations in order for descending
      const descColorCombos = [
        ...new Set(
          descCards.map((card) => {
            if (card.colors.length === 0) return 'C';
            if (card.colors.length > 1) return 'M';
            return card.colors[0];
          }),
        ),
      ];
      console.log(
        'Unique color combinations in order (desc):',
        descColorCombos,
      );

      // Verify the descending order
      expect(descColorCombos).toEqual(['C', 'M', 'G', 'R', 'B', 'U', 'W']);
    });
  });

  describe('getByName', () => {
    it('should find cards with exact and fuzzy matching', async () => {
      const results = await cardService.getByName('Black Lotus');
      expect(results).toBeTruthy();
      expect(results[0]?.name).toBe('Black Lotus');
    });
  });
});
