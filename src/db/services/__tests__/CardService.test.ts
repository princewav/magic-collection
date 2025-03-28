import { CardService } from '../CardService';

describe('CardService', () => {
  let cardService: CardService;

  beforeAll(async () => {
    cardService = new CardService();
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
      );

      const page2 = await cardService.getFilteredCardsWithPagination(
        filters,
        2,
        5,
      );

      expect(page1.cards.length).toBeLessThanOrEqual(5);
      expect(page2.cards.length).toBeLessThanOrEqual(5);
      expect(page1.total).toBe(page2.total);
      expect(page1.cards[0].name).not.toBe(page2.cards[0].name);
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
