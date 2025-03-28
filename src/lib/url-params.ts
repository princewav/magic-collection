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
    if (key !== 'page') {
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

  // Add exact color match
  if (filters.exactColorMatch) {
    searchParams.set('exact', filters.exactColorMatch.toString());
  }

  // Add sort fields
  if (filters.sortFields && filters.sortFields.length > 0) {
    const sortParam = filters.sortFields
      .map((sf) => `${sf.field}:${sf.order}`)
      .join(',');
    searchParams.set('sort', sortParam);
  }

  // Add deduplicate option
  searchParams.set('dedupe', deduplicate.toString());

  // Update URL without refreshing the page
  window.history.pushState({}, '', url.toString());
}

export function getFiltersFromUrl(): {
  filters: FilterOptions;
  deduplicate: boolean;
} {
  if (typeof window === 'undefined') {
    return { filters: {}, deduplicate: true };
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

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

  // Get exact color match
  const exactParam = params.get('exact');
  if (exactParam) {
    filters.exactColorMatch = exactParam === 'true';
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
  const deduplicate = dedupeParam ? dedupeParam === 'true' : true;

  return { filters, deduplicate };
}
