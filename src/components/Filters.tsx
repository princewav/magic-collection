'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ManaSymbol } from './ManaSymbol';
import { Slider } from '@/components/ui/slider';
import { SetFilter } from './SetFilter';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Trash2, Info } from 'lucide-react';
import { useCards } from '@/context/CardsContext';
import { useCollection } from '@/context/CollectionContext';
import { cn } from '@/lib/utils';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortOptions, type SortField } from './SortOptions';
import { FilterOptions } from '@/actions/card/load-cards';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function Filters({
  className,
  collectionType,
}: {
  className?: string;
  collectionType?: 'paper' | 'arena';
}) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use URL search params as the initial source of truth
  const urlColors = searchParams.get('colors')?.split(',') || [];
  const urlCmcParam = searchParams.get('cmc')?.split(',') || ['0', '10'];
  const urlCmcRange: [number, number] = [
    parseInt(urlCmcParam[0], 10),
    parseInt(urlCmcParam[1], 10),
  ];
  const urlRarities = searchParams.get('rarities')?.split(',') || [];
  const urlSets = searchParams.get('sets')?.split(',') || [];
  const urlDeduplicate = searchParams.get('dedupe') !== 'false'; // Default to true
  const urlHideTokens = searchParams.get('hide_tokens') === 'true'; // Default to false

  // Parse sort fields from URL
  const urlSortParam = searchParams.get('sort');
  const urlSortFields: SortField[] = urlSortParam
    ? urlSortParam.split(',').map((field) => {
        const [fieldName, order] = field.split(':');
        return {
          field: fieldName,
          order: order as 'asc' | 'desc',
        };
      })
    : [];

  // Optimistic UI states that will be used for rendering
  const [optimisticColors, setOptimisticColors] = useState<string[]>(urlColors);
  const [optimisticCmcRange, setOptimisticCmcRange] =
    useState<[number, number]>(urlCmcRange);
  const [optimisticRarities, setOptimisticRarities] =
    useState<string[]>(urlRarities);
  const [optimisticSets, setOptimisticSets] = useState<string[]>(urlSets);
  const [optimisticSortFields, setOptimisticSortFields] =
    useState<SortField[]>(urlSortFields);
  const [optimisticHideTokens, setOptimisticHideTokens] =
    useState<boolean>(urlHideTokens);

  // Sync optimistic states with URL when searchParams change
  useEffect(() => {
    const newUrlColors = searchParams.get('colors')?.split(',') || [];
    const newUrlCmcParam = searchParams.get('cmc')?.split(',') || ['0', '10'];
    const newUrlCmcRange: [number, number] = [
      parseInt(newUrlCmcParam[0], 10),
      parseInt(newUrlCmcParam[1], 10),
    ];
    const newUrlRarities = searchParams.get('rarities')?.split(',') || [];
    const newUrlSets = searchParams.get('sets')?.split(',') || [];

    const newUrlSortParam = searchParams.get('sort');
    const newUrlSortFields: SortField[] = newUrlSortParam
      ? newUrlSortParam.split(',').map((field) => {
          const [fieldName, order] = field.split(':');
          return {
            field: fieldName,
            order: order as 'asc' | 'desc',
          };
        })
      : [];

    const newUrlHideTokens = searchParams.get('hide_tokens') === 'true';

    // Update optimistic states to match URL values
    setOptimisticColors(newUrlColors);
    setOptimisticCmcRange(newUrlCmcRange);
    setOptimisticRarities(newUrlRarities);
    setOptimisticSets(newUrlSets);
    setOptimisticSortFields(newUrlSortFields);
    setOptimisticHideTokens(newUrlHideTokens);
  }, [searchParams]);

  // Create a debounced function to update URL with new filters
  const debouncedUpdateUrlFilters = useCallback(
    debounce(
      (
        updates: Partial<
          Omit<FilterOptions, 'exactColorMatch'> & {
            deduplicate?: boolean;
            hideTokens?: boolean;
          }
        >,
        preservePage = false,
      ) => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Reset page to 1 when filters change, unless preservePage is true
        if (!preservePage) {
          newParams.delete('page');
        }

        // Handle colors
        if (updates.colors !== undefined) {
          if (updates.colors.length > 0) {
            newParams.set('colors', updates.colors.join(','));
          } else {
            newParams.delete('colors');
          }
        }

        // Handle CMC range
        if (updates.cmcRange !== undefined) {
          newParams.set('cmc', `${updates.cmcRange[0]},${updates.cmcRange[1]}`);
        }

        // Handle rarities
        if (updates.rarities !== undefined) {
          if (updates.rarities.length > 0) {
            newParams.set('rarities', updates.rarities.join(','));
          } else {
            newParams.delete('rarities');
          }
        }

        // Handle sets
        if (updates.sets !== undefined) {
          if (updates.sets.length > 0) {
            newParams.set('sets', updates.sets.join(','));
          } else {
            newParams.delete('sets');
          }
        }

        // Handle sort fields
        if (updates.sortFields !== undefined) {
          if (updates.sortFields.length > 0) {
            const sortParam = updates.sortFields
              .map((sf) => `${sf.field}:${sf.order}`)
              .join(',');
            newParams.set('sort', sortParam);
          } else {
            newParams.delete('sort');
          }
        }

        // Handle hideTokens
        if (updates.hideTokens !== undefined) {
          if (updates.hideTokens) {
            newParams.set('hide_tokens', 'true');
          } else {
            newParams.delete('hide_tokens');
          }
        }

        // Delete exact param if it exists from old URLs
        newParams.delete('exact');

        // Handle deduplicate (only in main view, not in collection)
        if (!collectionType && updates.deduplicate !== undefined) {
          newParams.set('dedupe', updates.deduplicate.toString());
        }

        // Update URL without refreshing the page
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
      },
      300,
    ), // 300ms debounce delay
    [searchParams, router, pathname, collectionType],
  );

  // Handle deduplicate toggle from CardsContext
  const cardsContext = useCards();
  // const collectionContext = useCollection(); // collectionContext is not used

  // Track deduplicate state change from context and update URL if needed
  useEffect(() => {
    if (!collectionType && cardsContext.deduplicate !== urlDeduplicate) {
      debouncedUpdateUrlFilters(
        { deduplicate: cardsContext.deduplicate },
        true,
      );
    }
  }, [
    cardsContext.deduplicate,
    urlDeduplicate,
    debouncedUpdateUrlFilters,
    collectionType,
  ]);

  // Check if Multicolor filter is selected
  const isMulticolorSelected = optimisticColors.includes('M');
  // Count selected specific colors (excluding 'M')
  const specificColorsCount = optimisticColors.filter((c) => c !== 'M').length;

  // Handlers for filter changes with optimistic updates
  const toggleColor = (symbol: string) => {
    let newColors: string[];

    if (symbol === 'M') {
      // Toggle Multicolor filter (M)
      if (isMulticolorSelected) {
        // Remove M if it's already selected
        newColors = optimisticColors.filter((c) => c !== 'M');
      } else {
        // Add M to existing colors
        newColors = [...optimisticColors, 'M'];
      }
    } else {
      // Toggle specific color filter
      if (optimisticColors.includes(symbol)) {
        // Remove the specific color
        newColors = optimisticColors.filter((c) => c !== symbol);
      } else {
        // Add the specific color
        newColors = [...optimisticColors, symbol];
      }
    }

    // Optimistic UI update
    setOptimisticColors(newColors);

    // Debounced URL update
    debouncedUpdateUrlFilters({ colors: newColors });
  };

  const toggleRarity = (value: string) => {
    // Optimistic UI update
    const newRarities = optimisticRarities.includes(value)
      ? optimisticRarities.filter((r) => r !== value)
      : [...optimisticRarities, value];

    setOptimisticRarities(newRarities);

    // Debounced URL update
    debouncedUpdateUrlFilters({ rarities: newRarities });
  };

  const handleSetChange = (newSets: string[]) => {
    // Optimistic UI update
    setOptimisticSets(newSets);

    // Debounced URL update
    debouncedUpdateUrlFilters({ sets: newSets });
  };

  const handleSortFieldChange = (field: string) => {
    const existingField = optimisticSortFields.find((f) => f.field === field);
    let newFields: SortField[];

    if (existingField) {
      newFields = optimisticSortFields.map((f) =>
        f.field === field
          ? { ...f, order: f.order === 'asc' ? 'desc' : 'asc' }
          : f,
      );
    } else {
      newFields = [...optimisticSortFields, { field, order: 'asc' }];
    }

    // Optimistic UI update
    setOptimisticSortFields(newFields);

    // Debounced URL update
    debouncedUpdateUrlFilters({ sortFields: newFields });
  };

  const removeSortField = (field: string) => {
    const newFields = optimisticSortFields.filter((f) => f.field !== field);

    // Optimistic UI update
    setOptimisticSortFields(newFields);

    // Debounced URL update
    debouncedUpdateUrlFilters({ sortFields: newFields });
  };

  const handleCmcRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];

    // Optimistic UI update
    setOptimisticCmcRange(newRange);

    // Debounced URL update
    debouncedUpdateUrlFilters({ cmcRange: newRange });
  };

  const toggleHideTokens = () => {
    const newValue = !optimisticHideTokens;
    setOptimisticHideTokens(newValue);
    debouncedUpdateUrlFilters({ hideTokens: newValue }, true);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = optimisticSortFields.findIndex(
        (f) => f.field === active.id,
      );
      const newIndex = optimisticSortFields.findIndex(
        (f) => f.field === over.id,
      );

      const newFields = arrayMove(optimisticSortFields, oldIndex, newIndex);

      // Optimistic UI update
      setOptimisticSortFields(newFields);

      // Debounced URL update
      debouncedUpdateUrlFilters({ sortFields: newFields });
    }
  };

  const resetColors = () => {
    // Optimistic UI update
    setOptimisticColors([]);

    // Debounced URL update
    debouncedUpdateUrlFilters({ colors: [] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const colorFilters = [
    { symbol: 'W', name: 'White' },
    { symbol: 'U', name: 'Blue' },
    { symbol: 'B', name: 'Black' },
    { symbol: 'R', name: 'Red' },
    { symbol: 'G', name: 'Green' },
    { symbol: 'C', name: 'Colorless (no colors)' },
  ];

  const rarityOptions = [
    { symbol: 'C', name: 'Common', value: 'common' },
    { symbol: 'U', name: 'Uncommon', value: 'uncommon' },
    { symbol: 'R', name: 'Rare', value: 'rare' },
    { symbol: 'M', name: 'Mythic Rare', value: 'mythic' },
    { symbol: 'S', name: 'Special', value: 'special' },
  ];

  // Helper function to get a tooltip for the multicolor button based on state
  const getMulticolorTooltip = () => {
    if (!isMulticolorSelected) {
      return 'Multicolor - Show cards with two or more colors';
    } else if (specificColorsCount === 0) {
      return 'Multicolor - Currently showing all cards with two or more colors';
    } else if (specificColorsCount === 1) {
      return 'Multicolor + 1 Color - Currently showing cards that are exactly mono-colored';
    } else {
      return 'Multicolor + Multiple Colors - Currently showing cards with exactly these colors';
    }
  };

  // Helper function to get a tooltip for the color filtering behavior
  const getColorFilteringTooltip = () => {
    const wubrgColorsForTooltip = optimisticColors.filter(
      (c) => c !== 'M' && c !== 'C',
    );
    const includesColorless = optimisticColors.includes('C');

    if (optimisticColors.length === 0) {
      return 'Select colors to filter cards';
    }

    if (isMulticolorSelected) {
      // 'M' is selected
      if (wubrgColorsForTooltip.length > 0) {
        const colorNames = wubrgColorsForTooltip
          .map(
            (color) =>
              colorFilters.find((cf) => cf.symbol === color)?.name || color,
          )
          .join(', ');
        return `Showing multicolor cards that include ALL of: ${colorNames}`;
      } else {
        // Only 'M' selected, or 'M' and 'C' selected (no WUBRG colors)
        return 'Showing all cards with two or more colors';
      }
    } else {
      // 'M' is NOT selected
      if (includesColorless && wubrgColorsForTooltip.length === 0) {
        return 'Showing only colorless cards (cards with no colors)';
      } else if (includesColorless && wubrgColorsForTooltip.length > 0) {
        const colorNames = wubrgColorsForTooltip
          .map(
            (color) =>
              colorFilters.find((cf) => cf.symbol === color)?.name || color,
          )
          .join(', ');
        return `Showing cards that are ${colorNames} OR colorless`;
      } else if (!includesColorless && wubrgColorsForTooltip.length > 0) {
        const colorNames = wubrgColorsForTooltip
          .map(
            (color) =>
              colorFilters.find((cf) => cf.symbol === color)?.name || color,
          )
          .join(', ');
        return `Showing cards with any of: ${colorNames} (OR logic)`;
      } else {
        // This case might be reached if only 'C' was selected and it was cleared, but optimisticColors.length check for tooltip display should prevent this.
        // Or if colors array becomes empty but tooltip is still triggered by old logic.
        // Given the tooltip is shown only if optimisticColors.length > 0, specific handling for empty wubrgColorsForTooltip here might not be strictly necessary if 'C' is also not present.
        return 'Current color filter selection logic is active.'; // Fallback, ideally not shown.
      }
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        'relative min-h-9 rounded-lg border p-4 transition-all duration-300 ease-in-out',
        className,
      )}
    >
      {!isOpen && <h2 className="text-xs font-medium md:text-sm">Filters</h2>}
      <CollapsibleTrigger asChild>
        <div className="absolute top-5 right-3 flex cursor-pointer items-center justify-between">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 transition-transform duration-300" />
          ) : (
            <ChevronDown className="h-5 w-5 transition-transform duration-300" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
        <div>
          <div className="flex flex-col flex-wrap items-start justify-between gap-6 sm:flex-row">
            <div className="flex min-w-fit flex-col gap-2">
              <div className="flex items-center">
                <h3 className="text-xs font-medium md:text-sm">Colors</h3>
                {optimisticColors.length > 0 && (
                  <>
                    <TooltipProvider>
                      <Tooltip delayDuration={150}>
                        <TooltipTrigger asChild>
                          <button className="hover:bg-muted focus-visible:ring-ring ml-1.5 rounded-full p-0.5 focus-visible:ring-1 focus-visible:outline-none">
                            <Info className="text-muted-foreground h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          className="bg-popover text-popover-foreground max-w-xs rounded-md p-2 text-xs shadow-md"
                        >
                          <p>{getColorFilteringTooltip()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <button
                      onClick={resetColors}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-1.5 cursor-pointer rounded-full p-0.5 focus-visible:ring-1 focus-visible:outline-none"
                      title="Clear color filters"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap justify-start gap-2 px-1">
                {colorFilters.map((filter) => (
                  <button
                    key={filter.symbol}
                    onClick={() => toggleColor(filter.symbol)}
                    className={`flex size-6 items-center justify-center rounded-full p-1 transition-all md:size-7 ${
                      optimisticColors.includes(filter.symbol)
                        ? 'bg-primary/20 ring-primary ring-2'
                        : 'hover:bg-muted'
                    }`}
                    title={filter.name}
                  >
                    <ManaSymbol
                      symbol={filter.symbol}
                      size={20}
                      className="md:hidden"
                    />
                    <ManaSymbol
                      symbol={filter.symbol}
                      size={27}
                      className="hidden md:block"
                    />
                  </button>
                ))}
                {/* Multicolor filter button */}
                <button
                  onClick={() => toggleColor('M')}
                  className={`flex size-6 items-center justify-center rounded-full p-1 transition-all md:size-7 ${
                    isMulticolorSelected
                      ? 'bg-primary/20 ring-primary ring-2'
                      : 'hover:bg-muted'
                  }`}
                  title={getMulticolorTooltip()}
                >
                  <ManaSymbol symbol="M" size={20} className="md:hidden" />
                  <ManaSymbol
                    symbol="M"
                    size={27}
                    className="hidden md:block"
                  />
                </button>
              </div>
            </div>

            <div className="flex min-w-[200px] flex-col gap-5">
              <h3 className="text-xs font-medium md:text-sm">
                CMC: {optimisticCmcRange[0]} - {optimisticCmcRange[1]}
              </h3>
              <Slider
                defaultValue={[0, 16]}
                min={0}
                max={16}
                step={1}
                value={[optimisticCmcRange[0], optimisticCmcRange[1]]}
                onValueChange={handleCmcRangeChange}
                className="w-full self-center"
              />
            </div>

            <div className="flex min-w-fit flex-col gap-2">
              <h3 className="text-xs font-medium md:text-sm">Rarity</h3>
              <div className="flex flex-wrap justify-start gap-3 px-1">
                {rarityOptions.map((option) => (
                  <button
                    key={option.symbol}
                    onClick={() => toggleRarity(option.value)}
                    className={`flex size-6 items-center justify-center rounded-full transition-all md:size-7 ${
                      optimisticRarities.includes(option.value)
                        ? 'ring-2 ring-offset-1 ' +
                          (option.symbol === 'C'
                            ? 'ring-gray-400'
                            : option.symbol === 'U'
                              ? 'ring-cyan-500'
                              : option.symbol === 'R'
                                ? 'ring-amber-500'
                                : option.symbol === 'M'
                                  ? 'ring-orange-500'
                                  : 'ring-purple-500')
                        : 'hover:bg-muted'
                    }`}
                    title={option.name}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold shadow-sm md:text-base ${
                        option.symbol === 'C'
                          ? 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700'
                          : option.symbol === 'U'
                            ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black'
                            : option.symbol === 'R'
                              ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black'
                              : option.symbol === 'M'
                                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                                : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                      }`}
                    >
                      {option.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-w-fit flex-col gap-2.5">
              <h3 className="text-xs font-medium md:text-sm">Options</h3>
              <div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hide-tokens"
                    checked={optimisticHideTokens}
                    onCheckedChange={toggleHideTokens}
                  />
                  <Label htmlFor="hide-tokens">Hide Tokens</Label>
                </div>
                {!collectionType && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Switch
                      id="deduplicate"
                      checked={cardsContext.deduplicate}
                      onCheckedChange={cardsContext.toggleDeduplicate}
                    />
                    <Label htmlFor="deduplicate">One card per name</Label>
                  </div>
                )}
              </div>
            </div>

            <SetFilter
              selectedSets={optimisticSets}
              onSetChange={handleSetChange}
            />

            <SortOptions
              sortFields={optimisticSortFields}
              onSortFieldChange={handleSortFieldChange}
              onRemoveSortField={removeSortField}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
