import { FilterOptions } from '@/actions/card/load-cards';

/**
 * Interface representing the color filter information including the multicolor mode
 */
export interface ColorFilterInfo {
  colors: string[]; // All color symbols including 'M' if present
  specificColors: string[]; // Only the specific color symbols (W, U, B, R, G, C), and potentially 'M' if not filtered out by caller of processColorFilter
  includesMulticolor: boolean; // Whether 'M' is selected
  mode: MulticolorMode; // The operational mode based on selected colors
}

/**
 * Enum representing the different modes of color filtering with Multicolor
 */
export enum MulticolorMode {
  NONE = 'none', // No color filters
  MULTICOLOR_ONLY = 'multicolorOnly', // M selected, no specific WUBRGC colors. Query: size >= 2
  MULTICOLOR_INCLUDES_ALL_SPECIFIC = 'multicolorIncludesAllSpecific', // M selected, AND 1+ specific WUBRGC colors. Query: { $all: specificWUBRGColors, size >= 2 }
  AT_LEAST = 'atLeast', // No M, only specific WUBRGC colors (OR 'C'). Query: { $in: specificWUBRGColors } (with special 'C' handling)
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

  // Hide tokens option
  const hideTokensParam = getParam('hide_tokens');
  filters.hideTokens = hideTokensParam === 'true'; // Defaults to false if param is not 'true' or is missing

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
  // specificColors here will contain W, U, B, R, G, and C if they were selected alongside/without M.
  // It explicitly filters out only 'M'.
  const specificColors = colors.filter((c) => c !== 'M');

  let mode: MulticolorMode;

  if (!includesMulticolor) {
    // 'M' is NOT selected
    if (specificColors.length === 0) {
      // No colors selected at all (neither M nor WUBRGC)
      mode = MulticolorMode.NONE;
    } else {
      // Only specific colors (W,U,B,R,G,C selected), no 'M'
      mode = MulticolorMode.AT_LEAST;
    }
  } else {
    // 'M' IS selected
    // Check WUBRGC colors selected alongside M (excluding C for this check as C is not a WUBRG color)
    const wubrgColorsAlongsideM = specificColors.filter((c) => c !== 'C');
    if (wubrgColorsAlongsideM.length === 0) {
      // Only 'M' selected (or M+C, but no WUBRG)
      mode = MulticolorMode.MULTICOLOR_ONLY;
    } else {
      // 'M' selected AND one or more specific WUBRG colors
      mode = MulticolorMode.MULTICOLOR_INCLUDES_ALL_SPECIFIC;
    }
  }

  return {
    colors, // original full array from params
    specificColors, // colors from params excluding 'M' (so it contains W,U,B,R,G,C if selected)
    includesMulticolor,
    mode,
  };
}
