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
  public buildAggregationPipeline(filters: FilterOptions): Document[] {
    const query: Record<string, any> = {};
    this._applyFilters(query, filters); // Apply filters to build the match query

    const needsCustomSort = this._needsCustomSorting(filters);
    const sortStage = this._buildSortStage(filters);

    let pipeline: Document[] = [];

    pipeline.push({ $match: query }); // Start with the match stage

    if (needsCustomSort) {
      pipeline.push(...this._buildCustomSortStages(filters)); // Add custom sort fields if needed
    }

    pipeline.push({ $sort: sortStage }); // Add the sort stage

    // Add projection stage to remove temporary sort fields if they were added
    if (needsCustomSort) {
      const projectFields: Record<string, 0> = {};
      if (filters.sortFields?.some((f) => f.field === 'rarity')) {
        projectFields._rarityIndex = 0;
      }
      if (filters.sortFields?.some((f) => f.field === 'colors')) {
        projectFields._colorIndex = 0;
        projectFields._colorCategory = 0;
        projectFields._colorsArray = 0;
      }
      if (Object.keys(projectFields).length > 0) {
        pipeline.push({ $project: projectFields });
      }
    }

    // Return the complete pipeline stages array
    return pipeline;
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
