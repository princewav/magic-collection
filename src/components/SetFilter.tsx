import { useState, KeyboardEvent } from 'react';
import { X, Trash2 } from 'lucide-react';

interface SetFilterProps {
  selectedSets: string[];
  onSetChange: (sets: string[]) => void;
}

export function SetFilter({ selectedSets, onSetChange }: SetFilterProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.length === 3) {
      e.preventDefault();
      const newSet = inputValue.toUpperCase();
      if (!selectedSets.includes(newSet)) {
        onSetChange([...selectedSets, newSet]);
      }
      setInputValue('');
    }
  };

  const removeSet = (setToRemove: string) => {
    onSetChange(selectedSets.filter((s) => s !== setToRemove));
  };

  const clearAllSets = () => {
    onSetChange([]);
  };

  return (
    <div className="grid grid-rows-[auto_1fr] gap-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium md:text-sm">Sets</h3>
        {selectedSets.length > 0 && (
          <button
            onClick={clearAllSets}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clear all sets"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedSets.map((set) => (
          <div
            key={set}
            className="bg-primary/20 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold md:text-sm"
          >
            <span>{set}</span>
            <button
              onClick={() => removeSet(set)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          maxLength={3}
          placeholder="Enter set code (e.g. LTR)"
          className="focus:ring-primary h-8 rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
        />
      </div>
    </div>
  );
}
