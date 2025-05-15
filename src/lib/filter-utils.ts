import { FilterOptions } from '@/actions/card/load-cards';

/**
 * Interface representing the color filter information including the multicolor mode
 */
export interface ColorFilterInfo {
  colors: string[]; // All color symbols including 'M' if present
  specificColors: string[]; // Only the specific color symbols (W, U, B, R, G, C)
  includesMulticolor: boolean; // Whether 'M' is selected
  mode: MulticolorMode; // The operational mode based on selected colors
}

/**
 * Enum representing the different modes of color filtering with Multicolor
 */
export enum MulticolorMode {
  NONE = 'none', // No color filters
  MULTICOLOR_ONLY = 'multicolorOnly', // Only 'M' is selected
  EXACT_MONO = 'exactMono', // 'M' + exactly one color
  EXACT_MULTI = 'exactMulti', // 'M' + multiple specific colors
  AT_LEAST = 'atLeast', // Only specific colors (no 'M') - cards with at least one of these colors (OR logic)
}

/**
 * Enhanced FilterOptions with detailed color filter information
 */
export interface EnhancedFilterOptions
  extends Omit<FilterOptions, 'exactColorMatch'> {
  colorFilter: ColorFilterInfo;
}

/**
 * Parse filter parameters from URL search params with proper type conversion
 */
export function parseFiltersFromParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): {
  filters: EnhancedFilterOptions;
  deduplicate: boolean;
  page: number;
  pageSize: number;
} {
  // Helper to get a single value from searchParams
  const getParam = (name: string): string | null => {
    const value = searchParams[name];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  // Base filter options
  const filters: Partial<EnhancedFilterOptions> = {};

  // Parse color filter
  const colorsParam = getParam('colors');
  let colors: string[] = [];

  if (colorsParam) {
    colors = colorsParam.split(',');
  }

  // Process color filters to determine mode and extract specific colors
  const colorFilter = processColorFilter(colors);
  filters.colors = colors; // Keep the original colors array for compatibility
  filters.colorFilter = colorFilter;

  // CMC Range
  const cmcParam = getParam('cmc');
  if (cmcParam) {
    const [min, max] = cmcParam.split(',').map((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? 0 : num;
    });
    filters.cmcRange = [min, max ?? 16];
  } else {
    filters.cmcRange = [0, 16]; // Default range
  }

  // Rarities
  const raritiesParam = getParam('rarities');
  if (raritiesParam) {
    filters.rarities = raritiesParam.split(',');
  }

  // Sets
  const setsParam = getParam('sets');
  if (setsParam) {
    filters.sets = setsParam.split(',');
  }

  // Sort fields
  const sortParam = getParam('sort');
  if (sortParam) {
    filters.sortFields = sortParam.split(',').map((field) => {
      const [fieldName, order] = field.split(':');
      return {
        field: fieldName,
        order: (order || 'asc') as 'asc' | 'desc',
      };
    });
  }

  // Pagination
  const pageParam = getParam('page');
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

  const pageSizeParam = getParam('pageSize');
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 50;

  // Deduplicate option (one card per name)
  const dedupeParam = getParam('dedupe');
  const deduplicate = dedupeParam !== 'false'; // Default to true unless explicitly set to false

  return {
    filters: filters as EnhancedFilterOptions,
    deduplicate,
    page,
    pageSize,
  };
}

/**
 * Process the color filters to determine the mode and extract specific colors
 */
function processColorFilter(colors: string[]): ColorFilterInfo {
  const includesMulticolor = colors.includes('M');
  const specificColors = colors.filter((c) => c !== 'M');

  let mode: MulticolorMode;

  if (colors.length === 0) {
    mode = MulticolorMode.NONE;
  } else if (includesMulticolor && specificColors.length === 0) {
    mode = MulticolorMode.MULTICOLOR_ONLY;
  } else if (includesMulticolor && specificColors.length === 1) {
    mode = MulticolorMode.EXACT_MONO;
  } else if (includesMulticolor && specificColors.length > 1) {
    mode = MulticolorMode.EXACT_MULTI;
  } else {
    mode = MulticolorMode.AT_LEAST;
  }

  return {
    colors,
    specificColors,
    includesMulticolor,
    mode,
  };
}
