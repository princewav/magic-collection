import { Card, Rarity } from '@/types/card';
import { CardService } from '../CardService';
import { rarityOrder } from '@/types/card';
import { CardFilteringService } from '../CardFilteringService';
import { DB } from '../../db';
import { testCard } from './testCard';

describe('CardService', () => {
  let cardService: CardService;
  let mockCollection: any;

  beforeAll(async () => {
    cardService = new CardService(new CardFilteringService());

    // Ensure test card exists in database
    const collection = DB.collection('cards');
    const existingCard = await collection.findOne({ cardId: testCard.cardId });
    if (!existingCard) {
      await collection.insertOne(testCard);
    }
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

    it('should sort cards by rarity in ascending order', async () => {
      const filters = {
        sortFields: [{ field: 'rarity', order: 'asc' as const }],
        colors: ['R'],
        sets: ['tsr'],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        100, // Fetch enough cards to likely get all rarities
      );

      // Get unique rarities present in the results, maintaining their order
      const uniqueRaritiesInResult = [
        ...new Set(cards.map((card) => card.rarity)),
      ];

      // Filter the expected rarityOrder to only include rarities present in the results
      const expectedOrderForResults = rarityOrder.filter((r) =>
        uniqueRaritiesInResult.includes(r),
      );

      // Verify the order of the unique rarities found matches the expected order
      expect(uniqueRaritiesInResult).toEqual(expectedOrderForResults);

      // Additionally, verify the pairwise order within the results
      for (let i = 1; i < cards.length; i++) {
        const rarityIndexPrev = rarityOrder.indexOf(
          cards[i - 1].rarity as Rarity,
        );
        const rarityIndexCurr = rarityOrder.indexOf(cards[i].rarity as Rarity);
        expect(rarityIndexCurr).toBeGreaterThanOrEqual(rarityIndexPrev);
      }
    });

    it('should sort cards by rarity in descending order', async () => {
      const filters = {
        sortFields: [{ field: 'rarity', order: 'desc' as const }],
        colors: ['R'],
        sets: ['tsr'],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        100, // Fetch enough cards
      );

      const uniqueRaritiesInResult = [
        ...new Set(cards.map((card) => card.rarity)),
      ];

      // Expected descending order
      const expectedDescOrder = rarityOrder.slice().reverse();

      // Filter the expected descending order to only include rarities present in the results
      const expectedDescOrderForResults = expectedDescOrder.filter((r) =>
        uniqueRaritiesInResult.includes(r),
      );

      // Verify the order of the unique rarities found matches the expected descending order
      expect(uniqueRaritiesInResult).toEqual(expectedDescOrderForResults);

      // Additionally, verify the pairwise order within the results
      for (let i = 1; i < cards.length; i++) {
        const rarityIndexPrev = rarityOrder.indexOf(
          cards[i - 1].rarity as Rarity,
        );
        const rarityIndexCurr = rarityOrder.indexOf(cards[i].rarity as Rarity);
        expect(rarityIndexCurr).toBeLessThanOrEqual(rarityIndexPrev);
      }
    });
    const ascColorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];
    const descColorOrder = ascColorOrder.slice().reverse();

    const getColorCategory = (card: Card): string => {
      if (!card.colors || card.colors.length === 0) return 'C';
      if (card.colors.length > 1) return 'M';
      return card.colors[0];
    };

    it('should sort cards by colors in ascending order', async () => {
      const filters = {
        sortFields: [{ field: 'colors', order: 'asc' as const }],
        sets: ['tsr'],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        100, // Fetch enough cards to likely get all color categories
      );

      // Get unique color categories present in the results, maintaining their order
      const uniqueColorCategoriesInResult = [
        ...new Set(cards.map(getColorCategory)),
      ];

      // Filter the expected ascColorOrder to only include categories present in the results
      const expectedOrderForResults = ascColorOrder.filter((c) =>
        uniqueColorCategoriesInResult.includes(c),
      );

      // Verify the order of the unique color categories found matches the expected order
      expect(uniqueColorCategoriesInResult).toEqual(expectedOrderForResults);

      // Additionally, verify the pairwise order within the results
      for (let i = 1; i < cards.length; i++) {
        const colorIndexPrev = ascColorOrder.indexOf(
          getColorCategory(cards[i - 1]),
        );
        const colorIndexCurr = ascColorOrder.indexOf(
          getColorCategory(cards[i]),
        );
        // Handle cases where a category might not be in ascColorOrder (shouldn't happen with current logic)
        if (colorIndexPrev !== -1 && colorIndexCurr !== -1) {
          expect(colorIndexCurr).toBeGreaterThanOrEqual(colorIndexPrev);
        }
      }
    });

    it('should sort cards by colors in descending order', async () => {
      const filters = {
        sortFields: [{ field: 'colors', order: 'desc' as const }],
        sets: ['tsr'],
      };

      const { cards } = await cardService.getFilteredCardsWithPagination(
        filters,
        1,
        100, // Fetch enough cards
      );

      const uniqueColorCategoriesInResult = [
        ...new Set(cards.map(getColorCategory)),
      ];

      // Filter the expected descColorOrder to only include categories present in the results
      const expectedOrderForResults = descColorOrder.filter((c) =>
        uniqueColorCategoriesInResult.includes(c),
      );

      // Verify the order of the unique color categories found matches the expected descending order
      expect(uniqueColorCategoriesInResult).toEqual(expectedOrderForResults);

      // Additionally, verify the pairwise order within the results
      for (let i = 1; i < cards.length; i++) {
        const colorIndexPrev = descColorOrder.indexOf(
          getColorCategory(cards[i - 1]),
        );
        const colorIndexCurr = descColorOrder.indexOf(
          getColorCategory(cards[i]),
        );
        // Handle cases where a category might not be in descColorOrder
        if (colorIndexPrev !== -1 && colorIndexCurr !== -1) {
          expect(colorIndexCurr).toBeGreaterThanOrEqual(colorIndexPrev); // Descending order means higher index comes first
        }
      }
    });
  });

  describe('getByName', () => {
    it('should find cards with exact and fuzzy matching', async () => {
      const results = await cardService.getByName('Black Lotus');
      expect(results).toBeTruthy();
      expect(results[0]?.name).toBe('Black Lotus');
    });
  });

  describe('getFilteredCards', () => {
    it('should deduplicate cards and return the one with lowest collector number', async () => {
      // Execute the test with real database
      const result = await cardService.getFilteredCards(
        {
          sets: ['tdm'],
          sortFields: [{ field: 'collector_number', order: 'asc' }],
        },
        true,
      );

      // Find Clarion Conqueror in the results
      const clarionConqueror = result.find(
        (card) => card.name === 'Clarion Conqueror',
      );

      // Verify the result
      expect(clarionConqueror).toBeDefined();
      expect(clarionConqueror?.collector_number).toBe('5');
    });

    it('should find the test card in the database', async () => {
      const result = await cardService.getFilteredCards(
        {
          sets: ['tsr'],
          sortFields: [{ field: 'name', order: 'asc' }],
        },
        true,
      );

      const testCardResult = result.find((card) => card.name === 'test');
      expect(testCardResult).toBeDefined();
      expect(testCardResult?.cardId).toBe(
        '0656ed76-4c8e-4094-8edd-9b49780cadf-test',
      );
      expect(testCardResult?.set).toBe('tsr');
      expect(testCardResult?.colors).toEqual(['R']);
      expect(testCardResult?.cmc).toBe(1);
    });
  });
});
