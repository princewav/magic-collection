import { FilterOptions } from '@/actions/card/load-cards';

export function updateUrlWithFilters(
  filters: FilterOptions,
  deduplicate: boolean,
): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  // Clear existing filter parameters
  const searchParams = url.searchParams;
  Array.from(searchParams.keys()).forEach((key) => {
    if (key !== 'page' && key !== 'type') {
      // Preserve the collection type parameter
      searchParams.delete(key);
    }
  });

  // Add color filters
  if (filters.colors && filters.colors.length > 0) {
    searchParams.set('colors', filters.colors.join(','));
  }

  // Add CMC range
  if (filters.cmcRange) {
    searchParams.set('cmc', `${filters.cmcRange[0]},${filters.cmcRange[1]}`);
  }

  // Add rarity filters
  if (filters.rarities && filters.rarities.length > 0) {
    searchParams.set('rarities', filters.rarities.join(','));
  }

  // Add set filters
  if (filters.sets && filters.sets.length > 0) {
    searchParams.set('sets', filters.sets.join(','));
  }

  // Add sort fields
  if (filters.sortFields && filters.sortFields.length > 0) {
    const sortParam = filters.sortFields
      .map((sf) => `${sf.field}:${sf.order}`)
      .join(',');
    searchParams.set('sort', sortParam);
  }

  // Add deduplicate option only for the main cards view
  if (!url.pathname.includes('/collection/')) {
    searchParams.set('dedupe', deduplicate.toString());
  }

  // Update URL without refreshing the page
  window.history.pushState({}, '', url.toString());
}

// Add a type for the search params object to allow different implementations
type SearchParamsLike = {
  get(name: string): string | null;
  getAll?(name: string): string[]; // Optional, depending on usage
};

// Core parsing logic
function parseSearchParams(params: SearchParamsLike): {
  filters: FilterOptions;
  deduplicate: boolean;
} {
  const filters: FilterOptions = {};

  // Get color filters
  const colorsParam = params.get('colors');
  if (colorsParam) {
    filters.colors = colorsParam.split(',');
  }

  // Get CMC range
  const cmcParam = params.get('cmc');
  if (cmcParam) {
    const [min, max] = cmcParam.split(',').map(Number);
    filters.cmcRange = [min, max];
  }

  // Get rarity filters
  const raritiesParam = params.get('rarities');
  if (raritiesParam) {
    filters.rarities = raritiesParam.split(',');
  }

  // Get set filters
  const setsParam = params.get('sets');
  if (setsParam) {
    filters.sets = setsParam.split(',');
  }

  // Get sort fields
  const sortParam = params.get('sort');
  if (sortParam) {
    filters.sortFields = sortParam.split(',').map((field) => {
      const [fieldName, order] = field.split(':');
      return {
        field: fieldName,
        order: order as 'asc' | 'desc',
      };
    });
  }

  // Get deduplicate option
  const dedupeParam = params.get('dedupe');
  const deduplicate = dedupeParam ? dedupeParam === 'true' : true; // Default to true if not present

  return { filters, deduplicate };
}

// Client-side function using window.location
export function getFiltersFromUrl(): {
  filters: FilterOptions;
  deduplicate: boolean;
} {
  if (typeof window === 'undefined') {
    // Return default values or handle server-side case if needed differently here
    return { filters: {}, deduplicate: true };
  }

  const params = new URLSearchParams(window.location.search);
  const isCollectionPage = window.location.pathname.includes('/collection/');
  const result = parseSearchParams(params);

  // Force deduplicate to false for collection pages
  if (isCollectionPage) {
    result.deduplicate = false;
  }

  return result;
}

// Server-side function accepting Next.js searchParams object
export function getFiltersFromSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): { filters: FilterOptions; deduplicate: boolean; page: number } {
  // Adapt the Next.js searchParams object to SearchParamsLike interface
  const paramsAdapter: SearchParamsLike = {
    get: (name: string): string | null => {
      const value = searchParams[name];
      if (Array.isArray(value)) {
        return value[0] ?? null;
      }
      return value ?? null;
    },
  };

  const { filters, deduplicate } = parseSearchParams(paramsAdapter);

  // Get page number
  const pageParam = paramsAdapter.get('page');
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  return { filters, deduplicate, page };
}
