'use server';

import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import {
  Card,
  CollectionCard,
  extractMtgCardData,
  rarityOrder,
} from '@/types/card';
import { FilterOptions } from '@/actions/card/load-cards';
import { SortField } from '@/components/SortOptions';
import { DB } from '@/db/db';
import { Collection, Db } from 'mongodb';

const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

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
  // This might only be needed for initial count, aggregation handles fetching
  const cards = await collectionCardService.getByType(type);
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
    if (filters.exactColorMatch) {
      // Exact match: contains exactly the specified colors and no others
      matchConditions[`${lookupPrefix}color_identity`] = {
        $eq: filters.colors.sort(),
      };
    } else {
      // Contains AT LEAST the specified colors
      matchConditions[`${lookupPrefix}color_identity`] = {
        $all: filters.colors,
      };
    }
    // Handle colorless explicitly if 'C' is selected
    if (filters.colors.includes('C')) {
      matchConditions[`${lookupPrefix}color_identity`] = {
        $or: [
          matchConditions[`${lookupPrefix}color_identity`], // Keep existing color condition
          { [`${lookupPrefix}color_identity`]: { $size: 0 } }, // Match cards with empty color_identity array
          { [`${lookupPrefix}color_identity`]: { $exists: false } }, // Match cards where color_identity field doesn't exist
        ],
      };
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

  // Add more filters here based on FilterOptions (e.g., name search on cardDetails.name)

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
    // Add color category (C for colorless, M for multicolor, or first color)
    {
      $addFields: {
        _colorCategory: {
          $switch: {
            branches: [
              {
                case: { $eq: [{ $size: '$_colorIdentityArray' }, 0] },
                then: 'C',
              },
              {
                case: { $gt: [{ $size: '$_colorIdentityArray' }, 1] },
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
  console.log('Starting loadMoreCollectionCards with:', {
    collectionType,
    filters,
    page,
    pageSize,
  });

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
  console.log('Color sorting stages:', JSON.stringify(colorStages, null, 2));
  pipeline.push(...colorStages);

  // Stage 5.1: Add rarity sorting stage if needed
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
    console.log('Match stage:', JSON.stringify(matchStage, null, 2));
    pipeline.push(matchStage);
  }

  // Stage 7: Sort
  const sortStage = buildSortStage(filters.sortFields);
  console.log('Sort stage:', JSON.stringify(sortStage, null, 2));
  pipeline.push(sortStage);

  // Stage 8: Pagination
  const skip = (page - 1) * pageSize;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: pageSize });

  // Stage 9: Project
  pipeline.push({
    $project: {
      _id: { $toString: '$_id' },
      cardId: 1,
      quantity: 1,
      _colorIndex: 1,
      _colorCategory: 1,
      _colorIdentityArray: 1,
      _rarityIndex: 1,
      cardDetails: {
        id: 1,
        cardmarket_id: 1,
        name: 1,
        released_at: 1,
        scryfall_uri: 1,
        layout: 1,
        image_uris: 1,
        mana_cost: 1,
        cmc: 1,
        type_line: 1,
        oracle_text: 1,
        power: 1,
        toughness: 1,
        color_identity: 1,
        keywords: 1,
        legalities: 1,
        set: 1,
        set_name: 1,
        scryfall_set_uri: 1,
        collector_number: 1,
        rarity: 1,
        flavor_text: 1,
        cardmarket_uri: 1,
        card_faces: 1,
        prices: 1,
      },
    },
  });

  console.log('Complete pipeline:', JSON.stringify(pipeline, null, 2));

  try {
    const results = await collectionCardsRepo.aggregate(pipeline).toArray();
    console.log('Query results count:', results.length);
    console.log(
      'First 3 results with color info:',
      results.slice(0, 3).map((r) => ({
        name: r.cardDetails.name,
        colorIdentity: r.cardDetails.color_identity,
        _colorCategory: r._colorCategory,
        _colorIndex: r._colorIndex,
        _colorIdentityArray: r._colorIdentityArray,
      })),
    );

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

    console.log('Processed results count:', processedResults.length);
    console.log(
      'First 3 processed results:',
      processedResults.slice(0, 3).map((r) => ({
        name: r.name,
        colorIdentity: r.color_identity,
        quantity: r.quantity,
      })),
    );

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
