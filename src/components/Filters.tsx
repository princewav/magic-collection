'use client';

import { useState } from 'react';
import { ManaSymbol } from './ManaSymbol';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SetFilter } from './SetFilter';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from 'lucide-react';
import { useCards } from '@/context/CardsContext';
import { cn } from '@/lib/utils';

interface SortField {
  field: string;
  order: 'asc' | 'desc';
}

export function Filters({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const { filters, updateFilters } = useCards();
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

  // Sort options
  const sortOptions = [
    { value: 'cmc', label: 'CMC' },
    { value: 'rarity', label: 'Rarity' },
    { value: 'color', label: 'Color' },
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
    });
  };

  // Handle set change
  const handleSetChange = (newSets: string[]) => {
    setSelectedSets(newSets);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: selectedRarities,
      sets: newSets,
      sortFields,
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
    });
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
    });
  };

  // Move sort field
  const moveSortField = (fromIndex: number, toIndex: number) => {
    const newFields: SortField[] = [...sortFields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    setSortFields(newFields);
    updateFilters({
      colors: selectedColors,
      cmcRange,
      rarities: selectedRarities,
      sets: selectedSets,
      sortFields: newFields,
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
    });
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
      {!isOpen && <h2 className="text-base font-medium md:text-lg">Filters</h2>}
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
        <div className="">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {/* Color Filter */}
            <div className="grid grid-rows-[auto_1fr] gap-3">
              <h3 className="text-base font-medium md:text-lg">Colors</h3>
              <div className="flex flex-wrap justify-start gap-2">
                {colorFilters.map((filter) => (
                  <button
                    key={filter.symbol}
                    onClick={() => toggleColor(filter.symbol)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full p-1 transition-all sm:h-10 sm:w-10 ${
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
              </div>
            </div>

            {/* CMC Filter */}
            <div className="grid grid-rows-[auto_1fr] gap-3">
              <h3 className="text-base font-medium md:text-lg">
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
            <div className="grid grid-rows-[auto_1fr] gap-3">
              <h3 className="text-base font-medium md:text-lg">Rarity</h3>
              <div className="flex justify-start gap-2">
                {rarityOptions.map((option) => (
                  <button
                    key={option.symbol}
                    onClick={() => toggleRarity(option.value)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-all md:h-10 md:w-10 ${
                      selectedRarities.includes(option.value)
                        ? 'ring-2 ring-offset-2 ' +
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
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold shadow-sm md:h-7 md:w-7 md:text-base ${
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

            {/* Sort Options */}
            <div className="grid grid-rows-[auto_1fr] gap-3">
              <h3 className="text-base font-medium md:text-lg">Sort By</h3>
              <div className="grid grid-rows-[auto_auto] gap-3">
                {/* Active sort fields */}
                <div className="space-y-2">
                  {sortFields.map((field, index) => (
                    <div
                      key={field.field}
                      className="flex items-center gap-2 rounded-md border p-2"
                    >
                      <button
                        className="text-muted-foreground hover:text-foreground cursor-move"
                        onClick={() => {}}
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <span className="flex-1">
                        {
                          sortOptions.find((opt) => opt.value === field.field)
                            ?.label
                        }
                      </span>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleSortFieldChange(field.field)}
                      >
                        {field.order === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => removeSortField(field.field)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add sort field */}
                <div className="flex flex-wrap gap-2">
                  {sortOptions
                    .filter(
                      (option) =>
                        !sortFields.some((f) => f.field === option.value),
                    )
                    .map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        onClick={() => handleSortFieldChange(option.value)}
                        className="h-7 px-1.5 text-xs md:h-8 md:px-2 md:text-sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
