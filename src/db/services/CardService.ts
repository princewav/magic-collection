import { Card } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { Document } from 'mongodb';
import { Rarity, Layout } from '@/types/card';

interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  sets?: string[];
  exactColorMatch?: boolean;
}



const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

export class CardService extends BaseService<Card> {
  public repo = new RepoCls<Card>(DB, 'cards');

  async getByNameAndSet(name: string, set: string, setNumber: string = '') {
    if (!name) {
      return [];
    }

    // Define search strategies in order of specificity
    const searchStrategies = [
      // 1. Exact name + set + setNumber (if provided)
      { name, exact: true, includeSetNumber: true },
      // 2. Fuzzy name + set + setNumber (if provided)
      { name, exact: false, includeSetNumber: true },
      // 3. Exact name + set (without setNumber)
      { name, exact: true, includeSetNumber: false },
      // 4. Fuzzy name + set (without setNumber)
      { name, exact: false, includeSetNumber: false },
    ];

    const normalizedSet = set.toLowerCase();

    // Try each strategy until we find results
    for (const strategy of searchStrategies) {
      const query = {
        name: strategy.exact ? name : new RegExp(name, 'i'),
        ...(set ? { set: normalizedSet } : {}),
        ...(strategy.includeSetNumber && setNumber
          ? { collector_number: setNumber }
          : {}),
      };

      const results = await this.repo.findBy(query);
      if (results.length > 0) {
        return results;
      }
    }

    // If we reach here, no results were found with any strategy
    return [];
  }

  async getByName(name: string) {
    const exactMatch = await this.repo.findBy({ name });
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    return this.repo.findBy({ name: new RegExp(name, 'i') });
  }

  async getByCardId(ids: string[]): Promise<Card[] | null> {
    return this.repo.findBy({ cardId: { $in: ids } });
  }

  async getFilteredCards(
    filters: FilterOptions,
    deduplicate: boolean = true,
  ): Promise<Card[]> {
    const query: Record<string, any> = {};

    // Apply filters
    this.applyFilters(query, filters);

    const needsCustomSorting = this.needsCustomSorting(filters);
    const sortStage = this.buildSortStage(filters);

    let pipeline = [];

    if (needsCustomSorting) {
      // Use aggregation with custom sort fields
      pipeline = [
        { $match: query },
        ...this.buildCustomSortStages(filters),
        { $sort: sortStage },
        // Project out temporary fields
        {
          $project: {
            _rarityIndex: 0,
            _colorIndex: 0,
            _colorCategory: 0,
            _colorsArray: 0,
          },
        },
      ];
    } else {
      // Use simple find with standard sort
      pipeline = [{ $match: query }, { $sort: sortStage }];
    }

    const docs = await this.repo.collection.aggregate(pipeline).toArray();

    let cards = docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];

    // Apply deduplication if requested
    if (deduplicate) {
      cards = this.deduplicateCardsByName(cards);
    }

    return cards;
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 50,
    deduplicate: boolean = true,
  ): Promise<{ cards: Card[]; total: number }> {
    const query: Record<string, any> = {};

    // Apply filters
    this.applyFilters(query, filters);

    // When deduplicating, fetch more cards than needed to ensure we have enough after deduplication
    const fetchMultiplier = deduplicate ? 3 : 1;
    const skip = (page - 1) * pageSize;
    const limit = pageSize * fetchMultiplier;

    const needsCustomSorting = this.needsCustomSorting(filters);
    const sortStage = this.buildSortStage(filters);

    let pipeline = [];

    if (needsCustomSorting) {
      // Use aggregation with custom sort fields
      pipeline = [
        { $match: query },
        ...this.buildCustomSortStages(filters),
        { $sort: sortStage },
        // Project out temporary fields
        {
          $project: {
            _rarityIndex: 0,
            _colorIndex: 0,
            _colorCategory: 0,
            _colorsArray: 0,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ];
    } else {
      // Use simple find with standard sort
      pipeline = [
        { $match: query },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
      ];
    }

    // Execute queries in parallel
    const [total, docs] = await Promise.all([
      this.repo.collection.countDocuments(query),
      this.repo.collection.aggregate(pipeline).toArray(),
    ]);

    let cards = docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as Card[];

    // Apply deduplication if requested
    if (deduplicate) {
      const originalLength = cards.length;
      cards = this.deduplicateCardsByName(cards);

      // Limit to pageSize
      cards = cards.slice(0, pageSize);

      // If this is the first page, estimate total unique cards
      if (page === 1 && originalLength > 0) {
        // Calculate ratio of unique cards after deduplication
        const deduplicationRatio = cards.length / originalLength;
        // Estimate total unique cards in the collection
        const estimatedTotal = Math.max(
          Math.ceil(total * deduplicationRatio),
          cards.length,
        );

        return {
          cards,
          total: estimatedTotal,
        };
      }
    }

    return {
      cards,
      total,
    };
  }

  /**
   * Deduplicates a list of cards, keeping only one card with each unique name.
   * Prioritizes the most "normal" version of each card according to:
   * 1. Non-special sets (avoid promotional/special versions)
   * 2. Lower rarity (prefer common over uncommon, etc.)
   * 3. Standard layout (avoid split, transform cards, etc.)
   * 4. Lowest collector number (original printing in a set)
   * 5. Most recent set (for newer artwork/templating)
   */
  deduplicateCardsByName(cards: Card[]): Card[] {
    const acceptedLayouts = [
      Layout.SPLIT,
      Layout.FLIP,
      Layout.TRANSFORM,
      Layout.MODAL_DFC,
    ];
    
    const uniqueCards = new Map<string, Card>();

    // Score function for determining which version of a card to keep
    const getCardNormalityScore = (card: Card): number => {
      let score = 0;

      if (![Rarity.BONUS, Rarity.SPECIAL].includes(card.rarity as Rarity)) {
        score += 100;
      }

      // Prefer lower rarities
      const rarityValues: Record<string, number> = {
        common: 50,
        uncommon: 40,
        rare: 30,
        mythic: 20,
        bonus: 10,
        special: 0,
      };
      score += rarityValues[card.rarity] || 0;

      // Prefer normal layouts
      if (card.layout === Layout.NORMAL) {
        score += 30;
      } else if (
        
        acceptedLayouts.includes(card.layout as Layout)
      ) {
        score += 10;
      }

      // Prefer lowest collector number (original printing in a set)
      // Parse collector number to get numeric value (ignoring letters)
      const collectorNumber = card.collector_number || '';
      const numericPart = parseInt(
        collectorNumber.match(/^\d+/)?.[0] || '9999',
      );
      // Invert the value so lower numbers score higher
      score += (10000 - numericPart) / 100;

      // Prefer more recent sets (better artwork/templating)
      const releaseDate = new Date(card.released_at).getTime();
      score += releaseDate / 10000000000; // Normalize to a reasonable value

      return score;
    };

    // Process each card
    for (const card of cards) {
      const currentBestCard = uniqueCards.get(card.name);

      // If we haven't seen this card name yet, or this version is better, keep it
      if (
        !currentBestCard ||
        getCardNormalityScore(card) > getCardNormalityScore(currentBestCard)
      ) {
        uniqueCards.set(card.name, card);
      }
    }

    // Return the deduplicated list
    return Array.from(uniqueCards.values());
  }

  // Helper method to apply filters
  private applyFilters(
    query: Record<string, any>,
    filters: FilterOptions,
  ): void {
    // Apply color filter
    if (filters.colors && filters.colors.length > 0) {
      if (filters.exactColorMatch && filters.colors.length > 0) {
        // Exact color matching - only return cards with exactly these colors
        query.$and = [
          { colors: { $all: filters.colors } }, // Must contain all selected colors
          { colors: { $size: filters.colors.length } }, // Must have exactly this many colors
        ];
      } else {
        // Normal matching - return cards that have at least one of the selected colors
        query.colors = { $in: filters.colors };
      }
    }

    // Apply CMC range filter
    if (filters.cmcRange) {
      const [min, max] = filters.cmcRange;
      query.cmc = { $gte: min, $lte: max };
    }

    // Apply rarity filter
    if (filters.rarities && filters.rarities.length > 0) {
      query.rarity = { $in: filters.rarities };
    }

    // Apply set filter
    if (filters.sets && filters.sets.length > 0) {
      query.set = { $in: filters.sets.map((set) => set.toLowerCase()) };
    }
  }

  // Helper to check if custom sorting is needed
  private needsCustomSorting(filters: FilterOptions): boolean {
    return (
      filters.sortFields?.some(
        (f) => f.field === 'colors' || f.field === 'rarity',
      ) ?? false
    );
  }

  // Helper to build the custom sort stages
  private buildCustomSortStages(filters: FilterOptions): Document[] {
    const stages: Document[] = [];

    // Add field for rarity order if needed
    if (filters.sortFields?.some((f) => f.field === 'rarity')) {
      stages.push({
        $addFields: {
          _rarityIndex: {
            $indexOfArray: [Object.values(Rarity), '$rarity'],
          },
        },
      });
    }

    // Add field for color order if needed
    if (filters.sortFields?.some((f) => f.field === 'colors')) {
      // First add a field to ensure colors is an array
      stages.push({
        $addFields: {
          _colorsArray: {
            $cond: {
              if: { $eq: [{ $type: '$colors' }, 'array'] },
              then: '$colors',
              else: [],
            },
          },
        },
      });

      // Now add the color category
      stages.push({
        $addFields: {
          _colorCategory: {
            $cond: {
              if: { $eq: [{ $size: '$_colorsArray' }, 0] },
              then: 'C',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$_colorsArray' }, 1] },
                  then: 'M',
                  else: { $arrayElemAt: ['$_colorsArray', 0] },
                },
              },
            },
          },
        },
      });

      // Now add the index based on the category
      stages.push({
        $addFields: {
          _colorIndex: {
            $indexOfArray: [colorOrder, '$_colorCategory'],
          },
        },
      });
    }

    return stages;
  }

  // Helper to build sort stage
  private buildSortStage(filters: FilterOptions): Record<string, 1 | -1> {
    const sortStage: Record<string, 1 | -1> = {};

    if (filters.sortFields && filters.sortFields.length > 0) {
      for (const { field, order } of filters.sortFields) {
        const sortDirection = order === 'asc' ? 1 : -1;

        if (field === 'rarity') {
          sortStage._rarityIndex = sortDirection;
        } else if (field === 'colors') {
          sortStage._colorIndex = sortDirection;
        } else {
          sortStage[field] = sortDirection;
        }
      }
    }

    // Always add name as secondary sort criteria
    if (!sortStage.name) {
      sortStage.name = 1;
    }

    return sortStage;
  }
}

export const cardService = new CardService();
