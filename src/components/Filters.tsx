'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
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
import { getFiltersFromUrl } from '@/lib/url-params';
import { FilterOptions } from '@/actions/card/load-cards';

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

  // Use URL search params as the source of truth
  const urlColors = searchParams.get('colors')?.split(',') || [];
  const urlCmcParam = searchParams.get('cmc')?.split(',') || ['0', '10'];
  const urlCmcRange: [number, number] = [
    parseInt(urlCmcParam[0], 10),
    parseInt(urlCmcParam[1], 10),
  ];
  const urlRarities = searchParams.get('rarities')?.split(',') || [];
  const urlSets = searchParams.get('sets')?.split(',') || [];
  const urlExactColorMatch = searchParams.get('exact') === 'true';
  const urlDeduplicate = searchParams.get('dedupe') !== 'false'; // Default to true

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

  // Create a function to update URL with new filters
  const updateUrlFilters = useCallback(
    (
      updates: Partial<FilterOptions & { deduplicate?: boolean }>,
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

      // Handle exact color match
      if (updates.exactColorMatch !== undefined) {
        if (updates.exactColorMatch) {
          newParams.set('exact', 'true');
        } else {
          newParams.delete('exact');
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

      // Handle deduplicate (only in main view, not in collection)
      if (!collectionType && updates.deduplicate !== undefined) {
        newParams.set('dedupe', updates.deduplicate.toString());
      }

      // Update URL without refreshing the page
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, collectionType],
  );

  // Handle deduplicate toggle from CardsContext
  const cardsContext = useCards();
  const collectionContext = useCollection();

  // Track deduplicate state change from context and update URL if needed
  useEffect(() => {
    if (!collectionType && cardsContext.deduplicate !== urlDeduplicate) {
      updateUrlFilters({ deduplicate: cardsContext.deduplicate }, true);
    }
  }, [
    cardsContext.deduplicate,
    urlDeduplicate,
    updateUrlFilters,
    collectionType,
  ]);

  // Handlers for filter changes
  const toggleColor = (symbol: string) => {
    const newColors = urlColors.includes(symbol)
      ? urlColors.filter((c) => c !== symbol)
      : [...urlColors, symbol];

    updateUrlFilters({ colors: newColors });
  };

  const toggleExactColorMatch = () => {
    updateUrlFilters({ exactColorMatch: !urlExactColorMatch });
  };

  const toggleRarity = (value: string) => {
    const newRarities = urlRarities.includes(value)
      ? urlRarities.filter((r) => r !== value)
      : [...urlRarities, value];

    updateUrlFilters({ rarities: newRarities });
  };

  const handleSetChange = (newSets: string[]) => {
    updateUrlFilters({ sets: newSets });
  };

  const handleSortFieldChange = (field: string) => {
    const existingField = urlSortFields.find((f) => f.field === field);
    let newFields: SortField[];

    if (existingField) {
      newFields = urlSortFields.map((f) =>
        f.field === field
          ? { ...f, order: f.order === 'asc' ? 'desc' : 'asc' }
          : f,
      );
    } else {
      newFields = [...urlSortFields, { field, order: 'asc' }];
    }

    updateUrlFilters({ sortFields: newFields });
  };

  const removeSortField = (field: string) => {
    const newFields = urlSortFields.filter((f) => f.field !== field);
    updateUrlFilters({ sortFields: newFields });
  };

  const handleCmcRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    updateUrlFilters({ cmcRange: newRange });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = urlSortFields.findIndex((f) => f.field === active.id);
      const newIndex = urlSortFields.findIndex((f) => f.field === over.id);

      const newFields = arrayMove(urlSortFields, oldIndex, newIndex);
      updateUrlFilters({ sortFields: newFields });
    }
  };

  const resetColors = () => {
    updateUrlFilters({ colors: [], exactColorMatch: false });
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
    { symbol: 'C', name: 'Colorless' },
  ];

  const rarityOptions = [
    { symbol: 'C', name: 'Common', value: 'common' },
    { symbol: 'U', name: 'Uncommon', value: 'uncommon' },
    { symbol: 'R', name: 'Rare', value: 'rare' },
    { symbol: 'M', name: 'Mythic Rare', value: 'mythic' },
  ];

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
                {(urlColors.length > 0 || urlExactColorMatch) && (
                  <button
                    onClick={resetColors}
                    className="text-muted-foreground hover:text-foreground ml-2"
                    title="Clear color filters"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap justify-start gap-2 px-1">
                {colorFilters.map((filter) => (
                  <button
                    key={filter.symbol}
                    onClick={() => toggleColor(filter.symbol)}
                    className={`flex size-6 items-center justify-center rounded-full p-1 transition-all md:size-7 ${
                      urlColors.includes(filter.symbol)
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
                <button
                  onClick={toggleExactColorMatch}
                  className={`flex size-6 items-center justify-center rounded-full p-1 transition-all md:size-7 ${
                    urlExactColorMatch
                      ? 'bg-primary/20 ring-primary ring-2'
                      : 'hover:bg-muted'
                  }`}
                  title="Exact color match"
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
                CMC: {urlCmcRange[0]} - {urlCmcRange[1]}
              </h3>
              <Slider
                defaultValue={[0, 16]}
                min={0}
                max={16}
                step={1}
                value={[urlCmcRange[0], urlCmcRange[1]]}
                onValueChange={handleCmcRangeChange}
                className="w-full self-center"
              />
            </div>

            <div className="flex min-w-fit flex-col gap-2">
              <h3 className="text-xs font-medium md:text-sm">Rarity</h3>
              <div className="flex justify-start gap-3 px-1">
                {rarityOptions.map((option) => (
                  <button
                    key={option.symbol}
                    onClick={() => toggleRarity(option.value)}
                    className={`flex size-6 items-center justify-center rounded-full transition-all md:size-7 ${
                      urlRarities.includes(option.value)
                        ? 'ring-2 ring-offset-1 ' +
                          (option.symbol === 'C'
                            ? 'ring-gray-400'
                            : option.symbol === 'U'
                              ? 'ring-cyan-500'
                              : option.symbol === 'R'
                                ? 'ring-amber-500'
                                : 'ring-orange-500')
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
                              : 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                      }`}
                    >
                      {option.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {!collectionType && (
              <div className="flex min-w-fit flex-col gap-2.5">
                <h3 className="text-xs font-medium md:text-sm">Options</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="deduplicate"
                    checked={cardsContext.deduplicate}
                    onCheckedChange={cardsContext.toggleDeduplicate}
                  />
                  <Label htmlFor="deduplicate">One card per name</Label>
                </div>
              </div>
            )}

            <SetFilter selectedSets={urlSets} onSetChange={handleSetChange} />

            <SortOptions
              sortFields={urlSortFields}
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
