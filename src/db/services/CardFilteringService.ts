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
  textSearch?: string; // Added for searching by name and type line
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

    // Apply text search filtering on name and type_line
    if (filters.textSearch && filters.textSearch.trim() !== '') {
      const searchTerm = filters.textSearch.trim();
      // Create a case-insensitive regex for partial matching
      const searchRegex = new RegExp(searchTerm, 'i');

      // Search in both name and type_line using $or
      query.$or = [{ name: searchRegex }, { type_line: searchRegex }];
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
    const hasColorless = specificColors.includes('C');

    // Updated colorless condition: For lands, we want those with empty color_identity OR empty colors array
    // For non-lands, we want those with empty colors array
    const colorlessCondition = {
      $or: [
        // Non-land colorless cards (artifacts, eldrazi, etc.) - must have empty colors array
        {
          $and: [{ type_line: { $not: /land/i } }, { colors: { $size: 0 } }],
        },
        // Truly colorless lands - must have empty color_identity OR empty colors array
        {
          $and: [
            { type_line: /land/i },
            { color_identity: { $size: 0 } },
            { colors: { $size: 0 } },
          ],
        },
      ],
    };

    switch (mode) {
      case MulticolorMode.NONE:
        // No color filter
        break;

      case MulticolorMode.MULTICOLOR_ONLY:
        // Only 'M' filter (or M+C): show cards with 2+ colors
        if (hasColorless) {
          // If 'M' and 'C' are selected together, show multicolor OR colorless
          query.$or = [
            { $expr: { $gt: [{ $size: '$color_identity' }, 1] } },
            colorlessCondition,
          ];
        } else {
          // Just multicolor
          query.$expr = { $gt: [{ $size: '$color_identity' }, 1] };
        }
        break;

      case MulticolorMode.MULTICOLOR_INCLUDES_ALL_SPECIFIC:
        // 'M' selected AND one or more specific WUBRG colors selected.
        // Goal: Show cards that include ALL actualWUBRGColors AND are multicolor.
        if (actualWUBRGColors.length > 0) {
          // Base condition for WUBRG colors
          const conditions = [
            { color_identity: { $all: actualWUBRGColors } },
            { $expr: { $gte: [{ $size: '$color_identity' }, 2] } },
          ];

          // Handle colorless case
          if (hasColorless) {
            // Create an OR query to include colorless cards
            query.$or = [{ $and: conditions }, colorlessCondition];
          } else {
            // Just the multicolor condition
            query.$and = conditions;
          }
        } else if (hasColorless) {
          // Only 'M' and 'C' selected, no other colors
          query.$or = [
            { $expr: { $gt: [{ $size: '$color_identity' }, 1] } },
            colorlessCondition,
          ];
        } else {
          // Just 'M' selected - show all multicolor cards
          query.$expr = { $gt: [{ $size: '$color_identity' }, 1] };
        }
        break;

      case MulticolorMode.AT_LEAST:
        // This mode implies 'M' was NOT selected.
        // specificColors here can contain W,U,B,R,G, and/or C.
        const wubrgOnlyColors = specificColors.filter(
          (c) => c !== 'C' && c !== 'M',
        );

        if (hasColorless && wubrgOnlyColors.length > 0) {
          // Has 'C' and other WUBRG colors (e.g., White OR Colorless)
          query.$or = [
            { color_identity: { $in: wubrgOnlyColors } },
            colorlessCondition,
          ];
        } else if (hasColorless && wubrgOnlyColors.length === 0) {
          // Only 'C' is selected - use JUST the colorless condition
          Object.assign(query, colorlessCondition);
        } else if (!hasColorless && wubrgOnlyColors.length > 0) {
          // Only WUBRG colors, no 'C'
          query.color_identity = { $in: wubrgOnlyColors };
        }
        break;
    }
  }

  /** Checks if the filters require custom sorting logic (colors or rarity). */
  private _needsCustomSorting(filters: FilterOptions): boolean {
    return (
      filters.sortFields?.some(
        (f) =>
          f.field === 'colors' ||
          f.field === 'color_identity' ||
          f.field === 'rarity',
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

    if (
      filters.sortFields?.some(
        (f) => f.field === 'color_identity' || f.field === 'colors',
      )
    ) {
      // 1. Prepare fields based on `colors` for primary category determination
      stages.push({
        $addFields: {
          _actualColorsArrayForSort: { $ifNull: ['$colors', []] },
        },
      });
      stages.push({
        $addFields: {
          // Ensure _actualColorsArrayForSort is an array
          _actualColorsArrayForSort: {
            $cond: {
              if: { $isArray: '$_actualColorsArrayForSort' },
              then: '$_actualColorsArrayForSort',
              else: [],
            },
          },
        },
      });
      stages.push({
        $addFields: {
          _actualColorsSizeForSort: { $size: '$_actualColorsArrayForSort' },
        },
      });
      stages.push({
        $addFields: {
          _colorCategory: {
            $switch: {
              branches: [
                {
                  case: { $gt: ['$_actualColorsSizeForSort', 1] }, // More than 1 color in `colors` array
                  then: 'M',
                },
                {
                  case: { $eq: ['$_actualColorsSizeForSort', 1] }, // Exactly 1 color in `colors` array
                  then: { $arrayElemAt: ['$_actualColorsArrayForSort', 0] },
                },
              ],
              default: 'C', // 0 colors in `colors` array
            },
          },
        },
      });

      // 2. Prepare _colorIdentityArray for _multicolorSortKey (used when _colorCategory is 'M')
      stages.push({
        $addFields: {
          _colorIdentityArray: { $ifNull: ['$color_identity', []] },
        },
      });
      stages.push({
        $addFields: {
          // Ensure _colorIdentityArray is an array
          _colorIdentityArray: {
            $cond: {
              if: { $isArray: '$_colorIdentityArray' },
              then: '$_colorIdentityArray',
              else: [],
            },
          },
        },
      });
      // Add size of color_identity for sorting multicolor cards by number of colors
      stages.push({
        $addFields: {
          _multicolorIdentitySize: { $size: '$_colorIdentityArray' },
        },
      });

      stages.push({
        $addFields: {
          _colorIndex: { $indexOfArray: [colorOrder, '$_colorCategory'] },
        },
      });
      stages.push({
        $addFields: {
          _multicolorIdentityString: {
            $cond: {
              if: { $eq: ['$_colorCategory', 'M'] },
              then: {
                $reduce: {
                  input: '$_colorIdentityArray',
                  initialValue: '',
                  in: {
                    $concat: [
                      '$$value',
                      { $cond: [{ $eq: ['$$value', ''] }, '', ','] }, // Add comma separator if not the first element
                      '$$this',
                    ],
                  },
                },
              },
              else: null,
            },
          },
        },
      });

      // 3. Add _isLandForSort to push lands to the bottom within color groups
      stages.push({
        $addFields: {
          _isLandForSort: {
            $cond: {
              if: { $regexMatch: { input: '$type_line', regex: /land/i } }, // Case-insensitive match for "land"
              then: 1, // Lands get 1
              else: 0, // Non-lands get 0
            },
          },
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
        const sortDirection = order === 'desc' ? -1 : 1;
        switch (field) {
          case 'rarity':
            sortStage._rarityIndex = sortDirection;
            break;
          case 'color_identity':
          case 'colors':
            sortStage._colorIndex = sortDirection;
            sortStage._multicolorIdentitySize = sortDirection; // Sort by number of colors in identity
            sortStage._multicolorIdentityString = sortDirection; // Then by the identity string
            sortStage._isLandForSort = 1; // Always sort lands last (0 before 1)
            break;
          case 'collector_number':
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
      if (
        filters.sortFields?.some(
          (f) => f.field === 'color_identity' || f.field === 'colors',
        )
      ) {
        projectFields._colorIndex = 0;
        projectFields._colorCategory = 0;
        projectFields._actualColorsArrayForSort = 0;
        projectFields._actualColorsSizeForSort = 0;
        projectFields._colorIdentityArray = 0;
        projectFields._multicolorIdentitySize = 0;
        projectFields._multicolorIdentityString = 0;
        projectFields._isLandForSort = 0;
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
