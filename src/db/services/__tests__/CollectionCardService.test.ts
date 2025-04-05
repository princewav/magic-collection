import { CollectionCard } from '@/types/card';
import { CollectionCardService } from '../CollectionCardService';
import { CardFilteringService } from '../CardFilteringService';
import { DB } from '../../db';
import { ObjectId } from 'mongodb';

// Test collection card with link to an existing card in the db
const testCollectionCard: Partial<CollectionCard> & { cardId: string } = {
  cardId: '0656ed76-4c8e-4094-8edd-9b49780cadf-test', // Link to test card from CardService test
  quantity: 2,
  collectionType: 'paper',
  foil: 'normal',
  tags: ['red'],
  dateAdded: new Date(),
};

describe('CollectionCardService', () => {
  let collectionCardService: CollectionCardService;
  let testCardId: string;

  beforeAll(async () => {
    collectionCardService = new CollectionCardService(
      new CardFilteringService(),
    );

    // Ensure test collection card exists in database
    const collection = DB.collection('collection-cards');
    const existingCard = await collection.findOne({
      cardId: testCollectionCard.cardId,
    });

    if (!existingCard) {
      const result = await collection.insertOne(testCollectionCard);
      testCardId = result.insertedId.toString();
    } else {
      testCardId = existingCard._id.toString();
    }
  });

  afterAll(async () => {
    // Clean up test data
    await DB.collection('collection-cards').deleteOne({
      cardId: testCollectionCard.cardId,
    });
  });

  describe('getByCardId', () => {
    it('should find collection cards by card id', async () => {
      const result = await collectionCardService.getByCardId([
        testCollectionCard.cardId,
      ]);

      expect(result).toBeTruthy();
      expect(result?.length).toBeGreaterThan(0);
      expect(result?.[0]?.cardId).toBe(testCollectionCard.cardId);
      expect(result?.[0]?.quantity).toBe(testCollectionCard.quantity);
    });
  });

  describe('getByType', () => {
    it('should find collection cards by type', async () => {
      const result = await collectionCardService.getByType('paper');

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      const testCard = result.find(
        (card) => card.cardId === testCollectionCard.cardId,
      );
      expect(testCard).toBeDefined();
    });
  });

  describe('getFilteredCardsWithPagination', () => {
    it('should return filtered and paginated collection cards', async () => {
      const filters = {
        colors: ['R'],
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const { cards, total } =
        await collectionCardService.getFilteredCardsWithPagination(
          filters,
          1,
          10,
        );

      expect(cards).toBeInstanceOf(Array);
      expect(total).toBeGreaterThan(0);
      expect(cards.length).toBeLessThanOrEqual(10);

      // Find our test card in the results
      const testCard = cards.find(
        (card) => card.cardId === testCollectionCard.cardId,
      );
      expect(testCard).toBeDefined();
      expect(testCard?.quantity).toBe(testCollectionCard.quantity);
      expect(testCard?.collectionType).toBe('paper');
    });

    it('should filter by card attributes (CMC)', async () => {
      const filters = {
        cmcRange: [1, 1] as [number, number], // Our test card has CMC 1
        sortFields: [{ field: 'cmc', order: 'asc' as const }],
      };

      const { cards } =
        await collectionCardService.getFilteredCardsWithPagination(
          filters,
          1,
          10,
        );

      expect(cards.length).toBeGreaterThan(0);

      // All returned cards should have CMC 1
      cards.forEach((card) => {
        expect((card as any).cmc).toBe(1);
      });

      // Our test card should be in the results
      const testCard = cards.find(
        (card) => card.cardId === testCollectionCard.cardId,
      );
      expect(testCard).toBeDefined();
    });

    it('should filter by multiple colors', async () => {
      const filters = {
        colors: ['R'], // Our test card is red
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const { cards } =
        await collectionCardService.getFilteredCardsWithPagination(
          filters,
          1,
          10,
        );

      expect(cards.length).toBeGreaterThan(0);

      // All cards should have red in their colors
      cards.forEach((card) => {
        expect((card as any).colors.includes('R')).toBe(true);
      });

      // Our test card should be present
      const testCard = cards.find(
        (card) => card.cardId === testCollectionCard.cardId,
      );
      expect(testCard).toBeDefined();
    });

    it('should filter by set', async () => {
      const filters = {
        sets: ['tsr'], // Our test card is from tsr set
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      const { cards } =
        await collectionCardService.getFilteredCardsWithPagination(
          filters,
          1,
          10,
        );

      expect(cards.length).toBeGreaterThan(0);

      // All cards should be from the tsr set
      cards.forEach((card) => {
        expect((card as any).set).toBe('tsr');
      });

      // Our test card should be present
      const testCard = cards.find(
        (card) => card.cardId === testCollectionCard.cardId,
      );
      expect(testCard).toBeDefined();
    });

    it('should deduplicate cards when requested', async () => {
      // First, create a duplicate card with a different quantity
      const duplicateCard = {
        ...testCollectionCard,
        quantity: 1,
      };

      const collection = DB.collection('collection-cards');
      let duplicateCardId = ''; // Initialize with empty string

      try {
        // Insert duplicate
        const result = await collection.insertOne(duplicateCard);
        duplicateCardId = result.insertedId.toString();

        // Test with deduplication enabled (default is true)
        const { cards: deduplicatedCards } =
          await collectionCardService.getFilteredCardsWithPagination(
            {
              sets: ['tsr'],
              sortFields: [{ field: 'name', order: 'asc' as const }],
            },
            1,
            10,
            true,
          );

        // Find matching cards with our test card's name
        const testCardName = 'test'; // From CardService test
        const matchingCards = deduplicatedCards.filter(
          (card) => (card as any).name === testCardName,
        );

        // Should only have one card with this name
        expect(matchingCards.length).toBe(1);

        // Test with deduplication disabled
        const { cards: nonDeduplicatedCards } =
          await collectionCardService.getFilteredCardsWithPagination(
            {
              sets: ['tsr'],
              sortFields: [{ field: 'name', order: 'asc' as const }],
            },
            1,
            20,
            false,
          );

        // Find matching cards with our test card's name again
        const nonDedupMatchingCards = nonDeduplicatedCards.filter(
          (card) => (card as any).name === testCardName,
        );

        // Should have two cards with this name
        expect(nonDedupMatchingCards.length).toBe(2);
      } finally {
        // Clean up
        if (duplicateCardId) {
          await collection.deleteOne({ _id: new ObjectId(duplicateCardId) });
        }
      }
    });

    it('should handle pagination correctly', async () => {
      const filters = {
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      // Get results for page 1 with size 5
      const page1 = await collectionCardService.getFilteredCardsWithPagination(
        filters,
        1,
        5,
        false,
      );

      // Get results for page 2 with size 5
      const page2 = await collectionCardService.getFilteredCardsWithPagination(
        filters,
        2,
        5,
        false,
      );

      expect(page1.cards.length).toBeLessThanOrEqual(5);
      expect(page2.cards.length).toBeLessThanOrEqual(5);
      expect(page1.total).toBe(page2.total);

      // Verify pages have different content
      if (page1.cards.length > 0 && page2.cards.length > 0) {
        expect(page1.cards[0].id).not.toBe(page2.cards[0].id);
      }
    });

    it('should report correct total count', async () => {
      const filters = {
        colors: ['R'],
        sortFields: [{ field: 'name', order: 'asc' as const }],
      };

      // Get filtered cards
      const { total } =
        await collectionCardService.getFilteredCardsWithPagination(
          filters,
          1,
          1, // Get just one card to check if total is correctly calculated
        );

      // Get the same cards with a large page size to count manually
      const { cards } =
        await collectionCardService.getFilteredCardsWithPagination(
          filters,
          1,
          1000, // Large page size to get all matching records
        );

      // Total should match the actual number of cards returned
      expect(total).toBe(cards.length);
    });
  });

  describe('getByCardNames', () => {
    it('should find collection cards by card names', async () => {
      const result = await collectionCardService.getByCardNames(['test']); // 'test' is our test card name

      expect(result).toBeTruthy();
      expect(result?.length).toBeGreaterThan(0);
      const testCard = result?.find(
        (card) => card.cardId === testCollectionCard.cardId,
      );
      expect(testCard).toBeDefined();
      expect(testCard?.quantity).toBe(testCollectionCard.quantity);
    });
  });
});
