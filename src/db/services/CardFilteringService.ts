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
    const { mode, specificColors, includesMulticolor } = colorFilter;

    switch (mode) {
      case MulticolorMode.NONE:
        // No color filter
        break;

      case MulticolorMode.MULTICOLOR_ONLY:
        // Only 'M' filter: show cards with 2+ colors
        query.$expr = { $gt: [{ $size: '$color_identity' }, 1] };
        break;

      case MulticolorMode.EXACT_MONO:
        // 'M' + one color: show cards that are exactly mono-colored
        // If the specific color is 'C', it means we are looking for colorless cards that are also multicolor, which is impossible.
        // However, the UI might allow this selection. For now, treat 'C' as a normal color for $all.
        // A card cannot be both colorless (empty color_identity) and have a specific color.
        // This mode implies a single specific color. If 'C' is that color, this essentially means size 0 AND size 1, which is impossible.
        // The current logic `color_identity: { $all: specificColors }` and `$size: 1` will correctly yield no results if specificColors = ['C']
        query.$and = [
          { color_identity: { $all: specificColors } },
          { color_identity: { $size: 1 } },
        ];
        break;

      case MulticolorMode.EXACT_MULTI:
        // 'M' + multiple colors: show cards with exactly these colors
        // 'C' should not logically be part of specificColors here if we mean "exact match for these N colors"
        // as colorless means "has no colors".
        // The current logic `color_identity: { $all: specificColors }` and `$size: specificColors.length`
        // will correctly handle this. If 'C' is in specificColors, it won't match cards.
        query.$and = [
          { color_identity: { $all: specificColors } },
          { color_identity: { $size: specificColors.length } },
        ];
        break;

      case MulticolorMode.AT_LEAST:
        const hasColorless = specificColors.includes('C');
        const otherColors = specificColors.filter((c) => c !== 'C');

        if (hasColorless && otherColors.length > 0) {
          // Has 'C' and other colors (e.g., White OR Colorless)
          query.$or = [
            { color_identity: { $in: otherColors } },
            { color_identity: { $size: 0 } },
          ];
        } else if (hasColorless && otherColors.length === 0) {
          // Only 'C' is selected
          query.color_identity = { $size: 0 };
        } else if (!hasColorless && otherColors.length > 0) {
          // Only other colors, no 'C'
          query.color_identity = { $in: otherColors };
        }
        // If specificColors is empty (e.g. only 'M' was selected and then deselected, leading to AT_LEAST with empty specificColors),
        // no color filter is applied. This case should ideally be handled by mode being NONE.
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
