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

    if (filters.sortFields && filters.sortFields.length > 0) {
      for (const { field, order } of filters.sortFields) {
        const sortDirection = order === 'asc' ? 1 : -1;
        switch (field) {
          case 'rarity':
            sortStage._rarityIndex = sortDirection;
            break;
          case 'colors':
            sortStage._colorIndex = sortDirection;
            break;
          case 'cmc':
            sortStage.cmc = sortDirection;
            break;
          default:
            sortStage[field] = sortDirection;
            break;
        }
      }
    }

    if (
      !sortStage.name &&
      !filters.sortFields?.some((f) => f.field === 'name')
    ) {
      sortStage.name = 1;
    }
    if (!sortStage._id) {
      sortStage._id = 1; // Add _id for stable sort tie-breaking
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
    this._applyFilters(query, filters); // Apply filters to build the match query

    const needsCustomSort = this._needsCustomSorting(filters);
    const sortStage = this._buildSortStage(filters);

    let pipeline: Document[] = [];

    pipeline.push({ $match: query }); // Start with the match stage

    if (needsCustomSort) {
      pipeline.push(...this._buildCustomSortStages(filters)); // Add custom sort fields if needed
    }

    // Add stage to convert collector_number to numeric for proper sorting
    pipeline.push({
      $addFields: {
        _collectorNumberNumeric: {
          $convert: {
            input: '$collector_number',
            to: 'int',
            onError: 999999, // High number for non-numeric values
            onNull: 999999,
          },
        },
      },
    });

    // Modify the sort stage to use the numeric field
    const numericSortStage = { ...sortStage };
    if (numericSortStage.collector_number) {
      numericSortStage._collectorNumberNumeric =
        numericSortStage.collector_number;
      delete numericSortStage.collector_number;
    }

    pipeline.push({ $sort: numericSortStage }); // Add the modified sort stage

    // Deduplicate by name if requested, keeping the first document based on the sort order
    if (deduplicate) {
      pipeline.push({
        $group: {
          _id: '$name', // Group by card name
          firstDoc: { $first: '$$ROOT' }, // Keep the first document in each group
        },
      });
      pipeline.push({ $replaceRoot: { newRoot: '$firstDoc' } }); // Restore document structure
      // Re-sort after grouping, as $group doesn't guarantee order preservation
      if (needsCustomSort) {
        pipeline.push({ $sort: numericSortStage });
      } else {
        pipeline.push({ $sort: numericSortStage });
      }
    }

    // Prepare projection stage to remove temporary fields
    const projectFields: Record<string, 0> = {
      _collectorNumberNumeric: 0, // Always remove the numeric collector number field
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

    // Add projection stage if there are fields to remove
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
    const sortStage = this._buildSortStage(filters);

    let countPipeline: Document[] = [];

    countPipeline.push({ $match: query });

    // Add stages needed for sorting if deduplicating
    if (deduplicate) {
      if (needsCustomSort) {
        countPipeline.push(...this._buildCustomSortStages(filters));
      }

      // Add numeric conversion for collector_number
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

      // Modify sort stage to use numeric field
      const numericSortStage = { ...sortStage };
      if (numericSortStage.collector_number) {
        numericSortStage._collectorNumberNumeric =
          numericSortStage.collector_number;
        delete numericSortStage.collector_number;
      }

      countPipeline.push({ $sort: numericSortStage });
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
