'use client';

import { useState, useEffect } from 'react';
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCards } from '@/context/CardsContext';
import { cn } from '@/lib/utils';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortOptions, type SortField } from './SortOptions';
import { updateUrlWithFilters, getFiltersFromUrl } from '@/lib/url-params';

export function Filters({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const { filters, updateFilters, deduplicate, toggleDeduplicate } = useCards();
  const [selectedColors, setSelectedColors] = useState<string[]>(
    filters.colors || [],
  );
  const [cmcRange, setCmcRange] = useState<[number, number]>(
    filters.cmcRange || [0, 10],
  );
  const [selectedRarities, setSelectedRarities] = useState<string[]>(
    filters.rarities || [],
  );
  const [selectedSets, setSelectedSets] = useState<string[]>(
    filters.sets || [],
  );
  const [sortFields, setSortFields] = useState<SortField[]>(
    filters.sortFields || [],
  );
  const [exactColorMatch, setExactColorMatch] = useState<boolean>(
    filters.exactColorMatch || false,
  );

  // Sync with URL parameters on initial load
  useEffect(() => {
    const { filters: urlFilters, deduplicate: urlDeduplicate } =
      getFiltersFromUrl();

    // Only update if we have URL parameters
    if (Object.keys(urlFilters).length > 0) {
      const newFilters = {
        ...filters,
        ...urlFilters,
      };

      // Update local state
      if (urlFilters.colors) setSelectedColors(urlFilters.colors);
      if (urlFilters.cmcRange) setCmcRange(urlFilters.cmcRange);
      if (urlFilters.rarities) setSelectedRarities(urlFilters.rarities);
      if (urlFilters.sets) setSelectedSets(urlFilters.sets);
      if (urlFilters.sortFields) setSortFields(urlFilters.sortFields);
      if (urlFilters.exactColorMatch !== undefined)
        setExactColorMatch(urlFilters.exactColorMatch);

      // Update filters in context
      updateFilters(newFilters);

      // Update deduplicate if it's in the URL
      if (urlDeduplicate !== deduplicate) {
        toggleDeduplicate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when filters change
  useEffect(() => {
    updateUrlWithFilters(
      {
        colors: selectedColors,
        cmcRange,
        rarities: selectedRarities,
        sets: selectedSets,
        sortFields,
        exactColorMatch,
      },
      deduplicate,
    );
  }, [
    selectedColors,
    cmcRange,
    selectedRarities,
    selectedSets,
    sortFields,
    exactColorMatch,
    deduplicate,
  ]);

  // Color filter options
  const colorFilters = [
    { symbol: 'W', name: 'White' },
    { symbol: 'U', name: 'Blue' },
    { symbol: 'B', name: 'Black' },
    { symbol: 'R', name: 'Red' },
    { symbol: 'G', name: 'Green' },
    { symbol: 'C', name: 'Colorless' },
  ];

  // Rarity options
  const rarityOptions = [
    { symbol: 'C', name: 'Common', value: 'common' },
    { symbol: 'U', name: 'Uncommon', value: 'uncommon' },
    { symbol: 'R', name: 'Rare', value: 'rare' },
    { symbol: 'M', name: 'Mythic Rare', value: 'mythic' },
  ];

  // Toggle color selection
  const toggleColor = (symbol: string) => {
    const newColors = selectedColors.includes(symbol)
      ? selectedColors.filter((c) => c !== symbol)
      : [...selectedColors, symbol];
    setSelectedColors(newColors);
    updateFilters({
      colors: newColors,
      cmcRange,
      rarities: selectedRarities,
      sets: selectedSets,
      sortFields,
      exactColorMatch,
    });
  };

  // Toggle exact color match mode
  const toggleExactColorMatch = () => {
    const newExactColorMatch = !exactColorMatch;
    setExactColorMatch(newExactColorMatch);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: selectedRarities,
      sets: selectedSets,
      sortFields,
      exactColorMatch: newExactColorMatch,
    });
  };

  // Toggle rarity selection
  const toggleRarity = (value: string) => {
    const newRarities = selectedRarities.includes(value)
      ? selectedRarities.filter((r) => r !== value)
      : [...selectedRarities, value];
    setSelectedRarities(newRarities);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: newRarities,
      sets: selectedSets,
      sortFields,
      exactColorMatch,
    });
  };

  // Handle set change
  const handleSetChange = (newSets: string[]) => {
    setSelectedSets(newSets);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: selectedRarities,
      sets: newSets.map((set) => set.toLowerCase()),
      sortFields,
      exactColorMatch,
    });
  };

  // Handle sort field change
  const handleSortFieldChange = (field: string) => {
    const existingField = sortFields.find((f) => f.field === field);
    let newFields: SortField[];

    if (existingField) {
      newFields = sortFields.map((f) =>
        f.field === field
          ? { ...f, order: f.order === 'asc' ? 'desc' : 'asc' }
          : f,
      );
    } else {
      newFields = [...sortFields, { field, order: 'asc' }];
    }

    setSortFields(newFields);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: selectedRarities,
      sets: selectedSets,
      sortFields: newFields,
      exactColorMatch,
    });
    console.log('sortFields', newFields);
  };

  // Remove sort field
  const removeSortField = (field: string) => {
    const newFields = sortFields.filter((f) => f.field !== field);
    setSortFields(newFields);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: selectedRarities,
      sets: selectedSets,
      sortFields: newFields,
      exactColorMatch,
    });
  };

  // Handle CMC range change
  const handleCmcRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setCmcRange(newRange);
    updateFilters({
      colors: selectedColors,
      cmcRange: newRange,
      rarities: selectedRarities,
      sets: selectedSets,
      sortFields,
      exactColorMatch,
    });
  };

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sortFields.findIndex((f) => f.field === active.id);
      const newIndex = sortFields.findIndex((f) => f.field === over.id);

      const newFields = arrayMove(sortFields, oldIndex, newIndex);
      setSortFields(newFields);
      updateFilters({
        colors: selectedColors,
        cmcRange,
        rarities: selectedRarities,
        sets: selectedSets,
        sortFields: newFields,
        exactColorMatch,
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
            {/* Color Filter */}
            <div className="flex min-w-fit flex-col gap-2">
              <h3 className="text-xs font-medium md:text-sm">Colors</h3>
              <div className="flex flex-wrap justify-start gap-2 px-1">
                {colorFilters.map((filter) => (
                  <button
                    key={filter.symbol}
                    onClick={() => toggleColor(filter.symbol)}
                    className={`flex size-6 items-center justify-center rounded-full p-1 transition-all md:size-7 ${
                      selectedColors.includes(filter.symbol)
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
                {/* Multicolor Filter Toggle Button */}
                <button
                  onClick={toggleExactColorMatch}
                  className={`flex size-6 items-center justify-center rounded-full p-1 transition-all md:size-7 ${
                    exactColorMatch
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

            {/* CMC Filter */}
            <div className="flex min-w-[200px] flex-col gap-2">
              <h3 className="text-xs font-medium md:text-sm">
                CMC: {cmcRange[0]} - {cmcRange[1]}
              </h3>
              <Slider
                defaultValue={[0, 10]}
                min={0}
                max={10}
                step={1}
                value={[cmcRange[0], cmcRange[1]]}
                onValueChange={handleCmcRangeChange}
                className="w-full self-center"
              />
            </div>

            {/* Set Filter */}
            <SetFilter
              selectedSets={selectedSets}
              onSetChange={handleSetChange}
            />

            {/* Rarity Filter */}
            <div className="flex min-w-fit flex-col gap-2">
              <h3 className="text-xs font-medium md:text-sm">Rarity</h3>
              <div className="flex justify-start gap-3 px-1">
                {rarityOptions.map((option) => (
                  <button
                    key={option.symbol}
                    onClick={() => toggleRarity(option.value)}
                    className={`flex size-6 items-center justify-center rounded-full transition-all md:size-7 ${
                      selectedRarities.includes(option.value)
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

            {/* Deduplicate Toggle */}
            <div className="flex min-w-fit flex-col gap-2">
              <h3 className="text-xs font-medium md:text-sm">Options</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="deduplicate"
                  checked={deduplicate}
                  onCheckedChange={toggleDeduplicate}
                />
                <Label htmlFor="deduplicate">One card per name</Label>
              </div>
            </div>

            {/* Sort Options */}
            <SortOptions
              sortFields={sortFields}
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
