import { Document } from 'mongodb';
import { rarityOrder } from '@/types/card';
import { MulticolorMode, ColorFilterInfo } from '@/lib/filter-utils';

// Re-define or import FilterOptions if it's not globally available
// For now, assume FilterOptions structure is known
interface FilterOptions {
  colors?: string[];
  cmcRange?: [number, number];
  rarities?: string[];
  sortFields?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  sets?: string[];
  colorFilter?: ColorFilterInfo; // Added for enhanced filtering
}

const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

export class CardFilteringService {
  /** Applies filter criteria to a MongoDB query object. */
  private _applyFilters(
    query: Record<string, any>,
    filters: FilterOptions,
  ): void {
    // Handle the enhanced color filter logic if available
    if (filters.colorFilter) {
      this._applyColorFilter(query, filters.colorFilter);
    }

    if (filters.cmcRange) {
      const [min, max] = filters.cmcRange;
      query.cmc = { $gte: min, $lte: max };
    }

    if (filters.rarities && filters.rarities.length > 0) {
      query.rarity = { $in: filters.rarities };
    }

    if (filters.sets && filters.sets.length > 0) {
      query.set = { $in: filters.sets.map((set) => set.toLowerCase()) };
    }
  }

  /**
   * Applies color filtering based on the enhanced colorFilter object
   * Implements the multicolor filter logic (M)
   */
  private _applyColorFilter(
    query: Record<string, any>,
    colorFilter: ColorFilterInfo,
  ): void {
    const { mode, specificColors } = colorFilter;

    // For MULTICOLOR_INCLUDES_ALL_SPECIFIC, we need WUBRG colors for the $all operator.
    // 'C' (colorless) cannot be part of an $all operation for color_identity.
    const actualWUBRGColors = specificColors.filter(
      (c) => c !== 'C' && c !== 'M',
    ); // Ensure M is also out, though specificColors from processColorFilter already filters M

    switch (mode) {
      case MulticolorMode.NONE:
        // No color filter
        break;

      case MulticolorMode.MULTICOLOR_ONLY:
        // Only 'M' filter (or M+C): show cards with 2+ colors
        query.$expr = { $gt: [{ $size: '$color_identity' }, 1] };
        break;

      case MulticolorMode.MULTICOLOR_INCLUDES_ALL_SPECIFIC:
        // 'M' selected AND one or more specific WUBRG colors selected.
        // Goal: Show cards that include ALL actualWUBRGColors AND are multicolor.
        if (actualWUBRGColors.length > 0) {
          query.$and = [
            { color_identity: { $all: actualWUBRGColors } },
            { $expr: { $gte: [{ $size: '$color_identity' }, 2] } },
          ];
        } else {
          // This case occurs if 'M' was selected, but the only other specificColors were 'C' (or none).
          // e.g., User selected M and C. specificColors = ['C']. actualWUBRGColors = [].
          // This should behave like MULTICOLOR_ONLY: show all multicolor cards.
          query.$expr = { $gt: [{ $size: '$color_identity' }, 1] };
        }
        break;

      case MulticolorMode.AT_LEAST:
        // This mode implies 'M' was NOT selected.
        // specificColors here can contain W,U,B,R,G, and/or C.
        const hasColorless = specificColors.includes('C');
        const wubrgOnlyColors = specificColors.filter(
          (c) => c !== 'C' && c !== 'M',
        );

        if (hasColorless && wubrgOnlyColors.length > 0) {
          // Has 'C' and other WUBRG colors (e.g., White OR Colorless)
          query.$or = [
            { color_identity: { $in: wubrgOnlyColors } },
            { color_identity: { $size: 0 } },
          ];
        } else if (hasColorless && wubrgOnlyColors.length === 0) {
          // Only 'C' is selected
          query.color_identity = { $size: 0 };
        } else if (!hasColorless && wubrgOnlyColors.length > 0) {
          // Only WUBRG colors, no 'C'
          query.color_identity = { $in: wubrgOnlyColors };
        }
        // If specificColors was empty (e.g. after filtering M, C), no color filter applied here.
        // This state should ideally be MulticolorMode.NONE.
        break;
    }
  }

  /** Checks if the filters require custom sorting logic (colors or rarity). */
  private _needsCustomSorting(filters: FilterOptions): boolean {
    return (
      filters.sortFields?.some(
        (f) => f.field === 'color_identity' || f.field === 'rarity',
      ) ?? false
    );
  }

  /** Builds MongoDB aggregation stages for custom sorting based on rarity and colors. */
  private _buildCustomSortStages(filters: FilterOptions): Document[] {
    const stages: Document[] = [];

    if (filters.sortFields?.some((f) => f.field === 'rarity')) {
      stages.push({
        $addFields: {
          _rarityIndex: {
            $indexOfArray: [rarityOrder, '$rarity'],
          },
        },
      });
    }

    if (filters.sortFields?.some((f) => f.field === 'color_identity')) {
      stages.push({
        $addFields: {
          _colorIdentityArray: { $ifNull: ['$color_identity', []] },
        },
      });
      stages.push({
        $addFields: {
          _colorIdentityArray: {
            $cond: {
              if: { $isArray: '$_colorIdentityArray' },
              then: '$_colorIdentityArray',
              else: [],
            },
          },
        },
      });
      stages.push({
        $addFields: {
          _colorIdentitySizeValue: { $size: '$_colorIdentityArray' },
        },
      });
      stages.push({
        $addFields: {
          _colorCategory: {
            $switch: {
              branches: [
                {
                  // Case for colorless cards (empty color identity)
                  case: { $eq: ['$_colorIdentitySizeValue', 0] },
                  then: 'C',
                },
                {
                  // Case for multicolor cards (2+ colors)
                  case: { $gt: ['$_colorIdentitySizeValue', 1] },
                  then: 'M',
                },
              ],
              default: { $arrayElemAt: ['$_colorIdentityArray', 0] },
            },
          },
        },
      });
      stages.push({
        $addFields: {
          _colorIndex: { $indexOfArray: [colorOrder, '$_colorCategory'] },
        },
      });
    }

    return stages;
  }

  /** Builds the $sort stage for the MongoDB aggregation pipeline. */
  private _buildSortStage(filters: FilterOptions): Record<string, 1 | -1> {
    const sortStage: Record<string, 1 | -1> = {};

    // Add user-specified sort fields
    if (filters.sortFields) {
      filters.sortFields.forEach(({ field, order }) => {
        // Handle custom sort fields like rarity and colors
        const sortDirection = order === 'desc' ? -1 : 1;
        switch (field) {
          case 'rarity':
            sortStage._rarityIndex = sortDirection;
            break;
          case 'color_identity':
          case 'colors': // Support both for backward compatibility
            sortStage._colorIndex = sortDirection;
            break;
          case 'collector_number': // Ensure collector_number uses the numeric field
            sortStage._collectorNumberNumeric = sortDirection;
            break;
          case 'cmc':
            sortStage.cmc = sortDirection;
            break;
          default:
            sortStage[field] = sortDirection;
            break;
        }
      });
    }

    // Always sort by name as a tie-breaker if not already specified
    if (
      !sortStage.name &&
      !filters.sortFields?.some((f) => f.field === 'name')
    ) {
      sortStage.name = 1;
    }

    // Add numeric collector number sort if not specified and deduplication needs it
    if (!('_collectorNumberNumeric' in sortStage)) {
      sortStage._collectorNumberNumeric = 1;
    }

    return sortStage;
  }

  /**
   * Constructs the main aggregation pipeline stages based on filters.
   * Includes $match, custom sort fields ($addFields), $sort, and $project stages.
   */
  public buildAggregationPipeline(
    filters: FilterOptions,
    deduplicate: boolean = false,
  ): Document[] {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters);

    const needsCustomSort = this._needsCustomSorting(filters);
    const sortSpec = this._buildSortStage(filters); // Get the sort specification

    let pipeline: Document[] = [];

    pipeline.push({ $match: query });

    if (needsCustomSort) {
      pipeline.push(...this._buildCustomSortStages(filters));
    }

    pipeline.push({
      $addFields: {
        _collectorNumberNumeric: {
          $convert: {
            input: '$collector_number',
            to: 'int',
            onError: 999999,
            onNull: 999999,
          },
        },
      },
    });

    // Add the $sort stage correctly
    pipeline.push({ $sort: sortSpec });

    if (deduplicate) {
      pipeline.push({
        $group: {
          _id: '$name',
          firstDoc: { $first: '$$ROOT' },
        },
      });
      pipeline.push({ $replaceRoot: { newRoot: '$firstDoc' } });
      // Re-sort after grouping
      pipeline.push({ $sort: sortSpec }); // Use the same sort spec
    }

    const projectFields: Record<string, 0> = {
      _collectorNumberNumeric: 0,
    };

    if (needsCustomSort) {
      if (filters.sortFields?.some((f) => f.field === 'rarity')) {
        projectFields._rarityIndex = 0;
      }
      if (filters.sortFields?.some((f) => f.field === 'color_identity')) {
        projectFields._colorIndex = 0;
        projectFields._colorCategory = 0;
        projectFields._colorIdentityArray = 0;
        projectFields._colorIdentitySizeValue = 0;
      }
    }

    if (Object.keys(projectFields).length > 0) {
      pipeline.push({ $project: projectFields });
    }

    return pipeline;
  }

  /**
   * Builds the aggregation pipeline required to count documents based on filters,
   * optionally including deduplication.
   */
  public buildCountPipeline(
    filters: FilterOptions,
    deduplicate: boolean = false,
  ): Document[] {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters);

    let pipeline: Document[] = [{ $match: query }];

    if (deduplicate) {
      pipeline.push({
        $group: {
          _id: '$name',
          doc: { $first: '$$ROOT' },
        },
      });
    }

    pipeline.push({
      $count: 'total',
    });

    return pipeline;
  }

  /**
   * Builds a filter query object for MongoDB based on the provided filters.
   */
  public buildFilterQuery(filters: FilterOptions): Record<string, any> {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters);
    return query;
  }
}
