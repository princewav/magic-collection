'use server';

import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import { Card, CollectionCard, extractMtgCardData } from '@/types/card';
import { FilterOptions } from '@/actions/card/load-cards';
import { SortField } from '@/components/SortOptions';
import { DB } from '@/db/db';
import { Collection, Db } from 'mongodb';

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
      matchConditions[`${lookupPrefix}colors`] = { $eq: filters.colors.sort() };
    } else {
      // Contains AT LEAST the specified colors
      matchConditions[`${lookupPrefix}colors`] = { $all: filters.colors };
    }
    // Handle colorless explicitly if 'C' is selected
    if (filters.colors.includes('C')) {
      matchConditions[`${lookupPrefix}colors`] = {
        $or: [
          matchConditions[`${lookupPrefix}colors`], // Keep existing color condition
          { [`${lookupPrefix}colors`]: { $size: 0 } }, // Match cards with empty colors array
          { [`${lookupPrefix}colors`]: { $exists: false } }, // Match cards where colors field doesn't exist
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

const buildSortStage = (
  sortFields: SortField[] | undefined,
  lookupPrefix = 'cardDetails.',
) => {
  if (!sortFields || sortFields.length === 0) {
    // Default sort if none provided
    return { $sort: { [`${lookupPrefix}name`]: 1 } };
  }

  const sortSpec: any = {};
  sortFields.forEach((field) => {
    // Prefix field names that come from the joined 'cards' collection
    const prefixedField = [
      'name',
      'cmc',
      'rarity',
      'set',
      'released_at',
      'colors',
      // Add other Card fields here
    ].includes(field.field)
      ? `${lookupPrefix}${field.field}`
      : field.field; // Assume fields like 'quantity' are from CollectionCard
    sortSpec[prefixedField] = field.order === 'asc' ? 1 : -1;
  });

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

  // Stage 2: Lookup Card Details
  pipeline.push({
    $lookup: {
      from: 'cards',
      localField: 'cardId',
      foreignField: 'cardId',
      as: 'cardDetails',
    },
  });

  // Stage 3: Unwind
  pipeline.push({
    $unwind: { path: '$cardDetails', preserveNullAndEmptyArrays: false },
  });

  // Stage 4: Post-lookup match (filters)
  if (Object.keys(filters).length > 0) {
    const matchStage = buildMatchStage(filters);
    pipeline.push(matchStage);
  }

  // Stage 5: Sort
  const sortStage = buildSortStage(filters.sortFields);
  pipeline.push(sortStage);

  // Stage 6: Pagination
  const skip = (page - 1) * pageSize;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: pageSize });

  // Stage 7: Project
  pipeline.push({
    $project: {
      _id: { $toString: '$_id' },
      cardId: 1,
      quantity: 1,
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
        colors: 1,
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

  try {
    const results = await collectionCardsRepo.aggregate(pipeline).toArray();

    // Get total count
    const countPipeline = [
      { $match: { collectionType } },
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

    return {
      cards: results.map((result) => {
        const card = extractMtgCardData(result.cardDetails);
        return {
          ...card,
          quantity: result.quantity,
        };
      }),
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
