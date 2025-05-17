'use server';

import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import {
  Card,
  CollectionCard,
  extractMtgCardData,
  rarityOrder,
} from '@/types/card';
import { SortField } from '@/components/SortOptions';
import { DB } from '@/db/db';
import { Collection, Db } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

// Order for color sorting: W (white), U (blue), B (black), R (red), G (green), M (multicolor), C (colorless)
const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

export interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sets?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  hideTokens?: boolean;
  textSearch?: string;
}

export async function loadCardsById(ids: string[]): Promise<Card[]> {
  const cards = await cardService.getByCardId(ids);
  if (!cards) {
    throw new Error('Failed to load cards with ids: ' + ids.join(', '));
  }
  return cards;
}

export async function loadCardDetailsByNames(names: string[]): Promise<Card[]> {
  if (!names || names.length === 0) {
    return [];
  }
  const cards = await cardService.getCardsByNames(names);
  if (!cards) {
    // getCardsByNames returns [], so this check might be redundant, but keep for safety
    console.warn(
      'loadCardDetailsByNames received null/undefined from service for names:',
      names.join(', '),
    );
    return [];
  }
  return cards;
}

export async function loadCardsInCollection(
  type: 'paper' | 'arena',
): Promise<CollectionCard[]> {
  // Get the current user's session
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  // This might only be needed for initial count, aggregation handles fetching
  const cards = await collectionCardService.getByType(session.user.id, type);
  if (!cards) {
    throw new Error('Failed to load cards in collection: ' + type);
  }
  return cards;
}

const buildMatchStage = (
  filters: FilterOptions,
  lookupPrefix = 'cardDetails.',
) => {
  const matchConditions: any = {};

  if (filters.colors && filters.colors.length > 0) {
    const includesMulticolor = filters.colors.includes('M');
    const specificColors = filters.colors.filter((c) => c !== 'M' && c !== 'C');
    const includesColorless = filters.colors.includes('C');

    // Handle colorless cards separately
    if (includesColorless && filters.colors.length === 1) {
      // Only 'C' is selected - match cards with empty color_identity
      // Use a very simple and direct approach for colorless

      // Try different approaches for matching colorless cards
      matchConditions.$or = [
        // Approach 1: Empty array
        { [`${lookupPrefix}color_identity`]: [] },
        // Approach 2: Size 0
        { [`${lookupPrefix}color_identity`]: { $size: 0 } },
        // Approach 3: Using $expr
        { $expr: { $eq: [{ $size: `$${lookupPrefix}color_identity` }, 0] } },
        // Approach 4: Null check
        { [`${lookupPrefix}color_identity`]: null },
        // Approach 5: Field doesn't exist
        { [`${lookupPrefix}color_identity`]: { $exists: false } },
      ];
    } else {
      // Normal color filtering
      if (includesMulticolor && specificColors.length > 0) {
        // M + specific colors: Cards must have ALL the specified colors
        matchConditions[`${lookupPrefix}color_identity`] = {
          $all: specificColors,
        };
      } else if (!includesMulticolor && specificColors.length > 0) {
        // Only specific colors, no M: Cards with ANY of the specified colors (OR logic)
        let query = { $in: specificColors };

        // If colorless is also selected, create an $or condition to include it
        if (includesColorless) {
          matchConditions.$or = [
            { [`${lookupPrefix}color_identity`]: query },
            { [`${lookupPrefix}color_identity`]: { $size: 0 } },
            { [`${lookupPrefix}color_identity`]: { $exists: false } },
          ];
        } else {
          matchConditions[`${lookupPrefix}color_identity`] = query;
        }
      } else if (
        includesMulticolor &&
        specificColors.length === 0 &&
        !includesColorless
      ) {
        // Only M: Cards with 2+ colors
        // Use _colorIdentitySizeValue field if available (in pipelines), otherwise use $expr with $size
        if (lookupPrefix === 'cardDetails.') {
          matchConditions.$or = [
            { _colorIdentitySizeValue: { $gt: 1 } },
            {
              $expr: { $gt: [{ $size: `$${lookupPrefix}color_identity` }, 1] },
            },
          ];
        } else {
          matchConditions.$expr = {
            $gt: [{ $size: `$${lookupPrefix}color_identity` }, 1],
          };
        }
      } else if (
        includesMulticolor &&
        specificColors.length === 0 &&
        includesColorless
      ) {
        // M + C: Cards with 2+ colors OR colorless cards
        matchConditions.$or = [
          // Use _colorIdentitySizeValue if available
          ...(lookupPrefix === 'cardDetails.'
            ? [{ _colorIdentitySizeValue: { $gt: 1 } }]
            : []),
          { $expr: { $gt: [{ $size: `$${lookupPrefix}color_identity` }, 1] } },
          { [`${lookupPrefix}color_identity`]: { $size: 0 } },
          { [`${lookupPrefix}color_identity`]: { $exists: false } },
        ];
      }
    }
  }

  if (filters.cmcRange) {
    matchConditions[`${lookupPrefix}cmc`] = {
      $gte: filters.cmcRange[0],
      $lte: filters.cmcRange[1],
    };
  }

  if (filters.rarities && filters.rarities.length > 0) {
    matchConditions[`${lookupPrefix}rarity`] = { $in: filters.rarities };
  }

  if (filters.sets && filters.sets.length > 0) {
    matchConditions[`${lookupPrefix}set`] = { $in: filters.sets };
  }

  // Add filter for hideTokens
  if (filters.hideTokens) {
    // This regex will match if "Token" or "Card" is a whole word in the type_line, case-insensitive.
    // It aims to exclude cards that are primarily tokens or cards, e.g., "Token Creature — Spirit" or "Card — Artifact"
    matchConditions[`${lookupPrefix}type_line`] = { $not: /\b(Token|Card)\b/i };
  }

  // Add text search for name and type_line
  if (filters.textSearch && filters.textSearch.trim() !== '') {
    const searchTerm = filters.textSearch.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Search in both name and type_line
    matchConditions.$or = [
      ...(matchConditions.$or || []),
      { [`${lookupPrefix}name`]: searchRegex },
      { [`${lookupPrefix}type_line`]: searchRegex },
    ];
  }

  return { $match: matchConditions };
};

const buildColorSortStages = (lookupPrefix = 'cardDetails.') => {
  return [
    // Add color identity array field
    {
      $addFields: {
        _colorIdentityArray: {
          $ifNull: [`$${lookupPrefix}color_identity`, []],
        },
      },
    },
    // Ensure it's an array
    {
      $addFields: {
        _colorIdentityArray: {
          $cond: {
            if: { $isArray: '$_colorIdentityArray' },
            then: '$_colorIdentityArray',
            else: [],
          },
        },
      },
    },
    // Calculate size of color identity array
    {
      $addFields: {
        _colorIdentitySizeValue: { $size: '$_colorIdentityArray' },
      },
    },
    // Add color category (C for colorless, M for multicolor, or first color)
    {
      $addFields: {
        _colorCategory: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$_colorIdentitySizeValue', 0] },
                then: 'C',
              },
              {
                case: { $gt: ['$_colorIdentitySizeValue', 1] },
                then: 'M',
              },
            ],
            default: { $arrayElemAt: ['$_colorIdentityArray', 0] },
          },
        },
      },
    },
    // Add color index for sorting
    {
      $addFields: {
        _colorIndex: {
          $indexOfArray: [colorOrder, '$_colorCategory'],
        },
      },
    },
  ];
};

const buildSortStage = (
  sortFields: SortField[] | undefined,
  lookupPrefix = 'cardDetails.',
) => {
  if (!sortFields || sortFields.length === 0) {
    // Default sort by color identity and name
    return {
      $sort: {
        _colorIndex: 1,
        [`${lookupPrefix}name`]: 1,
      },
    };
  }

  const sortSpec: Record<string, 1 | -1> = {};

  sortFields.forEach(({ field, order }) => {
    const sortDirection = order === 'desc' ? -1 : 1;
    switch (field) {
      case 'color_identity':
      case 'colors':
        sortSpec._colorIndex = sortDirection;
        break;
      case 'rarity':
        sortSpec._rarityIndex = sortDirection;
        break;
      case 'cmc':
        sortSpec[`${lookupPrefix}cmc`] = sortDirection;
        break;
      case 'set':
        sortSpec[`${lookupPrefix}set`] = sortDirection;
        break;
      case 'released_at':
        sortSpec[`${lookupPrefix}released_at`] = sortDirection;
        break;
      default:
        sortSpec[`${lookupPrefix}${field}`] = sortDirection;
        break;
    }
  });

  // Always add name as a tie-breaker if not specified
  if (!sortSpec[`${lookupPrefix}name`]) {
    sortSpec[`${lookupPrefix}name`] = 1;
  }

  return { $sort: sortSpec };
};

export async function loadMoreCollectionCards(
  collectionType: 'paper' | 'arena',
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 50,
) {
  const db: Db = DB;
  const collectionCardsRepo: Collection<CollectionCard> =
    db.collection('collection-cards');

  const pipeline: any[] = [];

  // Stage 1: Initial Match
  pipeline.push({ $match: { collectionType } });

  // Stage 2: Group by cardId and sum quantities
  pipeline.push({
    $group: {
      _id: '$cardId',
      quantity: { $sum: '$quantity' },
      cardId: { $first: '$cardId' },
      collectionType: { $first: '$collectionType' },
    },
  });

  // Stage 3: Lookup Card Details
  pipeline.push({
    $lookup: {
      from: 'cards',
      localField: 'cardId',
      foreignField: 'cardId',
      as: 'cardDetails',
    },
  });

  // Stage 4: Unwind
  pipeline.push({
    $unwind: { path: '$cardDetails', preserveNullAndEmptyArrays: false },
  });

  // Stage 5: Add color sorting stages
  const colorStages = buildColorSortStages();
  pipeline.push(...colorStages);

  // Stage 5.1: Add color identity size calculation for filter conditions
  if (filters.colors?.includes('M') || filters.colors?.includes('C')) {
    pipeline.push({
      $addFields: {
        _colorIdentitySizeValue: { $size: '$_colorIdentityArray' },
      },
    });
  }

  // Stage 5.2: Add rarity sorting stage if needed
  if (filters.sortFields?.some((f) => f.field === 'rarity')) {
    pipeline.push({
      $addFields: {
        _rarityIndex: {
          $indexOfArray: [rarityOrder, '$cardDetails.rarity'],
        },
      },
    });
  }

  // Stage 6: Post-lookup match (filters)
  if (Object.keys(filters).length > 0) {
    const matchStage = buildMatchStage(filters);
    pipeline.push(matchStage);
  }

  // Stage 7: Sort
  const sortStage = buildSortStage(filters.sortFields);
  pipeline.push(sortStage);

  // Stage 8: Pagination
  const skip = (page - 1) * pageSize;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: pageSize });

  // Stage 9: Project fields to include
  pipeline.push({
    $project: {
      _id: { $toString: '$_id' },
      cardId: 1,
      quantity: 1,
      _rarityIndex: 1,
      cardDetails: 1,
    },
  });

  // Stage 10: Remove temporary fields (exclusion-only stage)
  pipeline.push({
    $project: {
      _colorIdentitySizeValue: 0,
    },
  });

  try {
    // Print the query when colorless filter is used

    const results = await collectionCardsRepo.aggregate(pipeline).toArray();

    // If colorless filter and no results, show first 5 cards that should match
    if (filters.colors?.includes('C') && results.length === 0) {
      // Try to find any colorless cards directly
      const colorlessCheck = await db
        .collection('cards')
        .find({ color_identity: { $size: 0 } })
        .limit(5)
        .toArray();
    }

    // Get total count with the same grouping logic
    const countPipeline = [
      { $match: { collectionType } },
      {
        $group: {
          _id: '$cardId',
          cardId: { $first: '$cardId' },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'cards',
          localField: 'cardId',
          foreignField: 'cardId',
          as: 'cardDetails',
        },
      },
      { $unwind: { path: '$cardDetails', preserveNullAndEmptyArrays: false } },
    ];

    // Add color identity size calculation for filter conditions that use it
    if (filters.colors?.includes('M') || filters.colors?.includes('C')) {
      countPipeline.push({
        $addFields: {
          _colorIdentitySizeValue: { $size: '$cardDetails.color_identity' },
        },
      } as any);
    }

    if (Object.keys(filters).length > 0) {
      const matchStage = buildMatchStage(filters);
      countPipeline.push(matchStage);
    }

    const total = await collectionCardsRepo.aggregate(countPipeline).toArray();

    const processedResults = results.map((result) => {
      const card = extractMtgCardData(result.cardDetails);
      return {
        ...card,
        quantity: result.quantity,
      };
    });

    return {
      cards: processedResults,
      total: total.length,
    };
  } catch (error) {
    console.error('[loadMoreCollectionCards] Error:', error);
    throw new Error('Failed to load collection cards');
  }
}

export async function fetchCollectionCards(
  type: 'paper' | 'arena',
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 50,
) {
  // Use the aggregation function for all collection card loads
  return loadMoreCollectionCards(type, filters, page, pageSize);
}

export async function loadFilteredCards(
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 50,
  deduplicate: boolean = true,
) {
  try {
    const { cards, total } = await cardService.getFilteredCardsWithPagination(
      filters,
      page,
      pageSize,
      deduplicate,
    );
    return { cards, total };
  } catch (error) {
    console.error('Error loading filtered cards:', error);
    return { cards: [], total: 0 };
  }
}
