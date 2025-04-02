import { Document } from 'mongodb';
import { rarityOrder } from '@/types/card';

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
  exactColorMatch?: boolean;
}

const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

export class CardFilteringService {
  /** Applies filter criteria to a MongoDB query object. */
  private _applyFilters(
    query: Record<string, any>,
    filters: FilterOptions,
  ): void {
    if (filters.colors && filters.colors.length > 0) {
      if (filters.exactColorMatch) {
        query.$and = [
          { colors: { $all: filters.colors } },
          { colors: { $size: filters.colors.length } },
        ];
      } else {
        query.colors = { $in: filters.colors };
      }
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

  /** Checks if the filters require custom sorting logic (colors or rarity). */
  private _needsCustomSorting(filters: FilterOptions): boolean {
    return (
      filters.sortFields?.some(
        (f) => f.field === 'colors' || f.field === 'rarity',
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

    if (filters.sortFields?.some((f) => f.field === 'colors')) {
      stages.push({
        $addFields: {
          _colorsArray: { $ifNull: ['$colors', []] },
        },
      });
      stages.push({
        $addFields: {
          _colorsArray: {
            $cond: {
              if: { $isArray: '$_colorsArray' },
              then: '$_colorsArray',
              else: [],
            },
          },
        },
      });
      stages.push({
        $addFields: {
          _colorCategory: {
            $switch: {
              branches: [
                { case: { $eq: [{ $size: '$_colorsArray' }, 0] }, then: 'C' },
                { case: { $gt: [{ $size: '$_colorsArray' }, 1] }, then: 'M' },
              ],
              default: { $arrayElemAt: ['$_colorsArray', 0] },
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
          case 'colors':
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
      if (filters.sortFields?.some((f) => f.field === 'colors')) {
        projectFields._colorIndex = 0;
        projectFields._colorCategory = 0;
        projectFields._colorsArray = 0;
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

    const needsCustomSort = this._needsCustomSorting(filters);
    const sortSpec = this._buildSortStage(filters); // Get the sort specification

    let countPipeline: Document[] = [];

    countPipeline.push({ $match: query });

    if (deduplicate) {
      if (needsCustomSort) {
        countPipeline.push(...this._buildCustomSortStages(filters));
      }

      countPipeline.push({
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
      countPipeline.push({ $sort: sortSpec });
      countPipeline.push({
        $group: {
          _id: '$name',
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    return countPipeline;
  }

  /**
   * Builds the query object used for counting documents, applying only the filters.
   * This is separate because countDocuments doesn't use the full pipeline.
   */
  public buildFilterQuery(filters: FilterOptions): Record<string, any> {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters);
    return query;
  }
}
