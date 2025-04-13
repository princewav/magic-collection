'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, XCircle, CheckCircle, X, Check } from 'lucide-react';

interface TrackedQuantityCounterProps {
  wishlistId: string;
  cardId: string;
  targetQuantity: number;
}

// Function to generate localStorage key
export const getLocalStorageKey = (wishlistId: string, cardId: string) =>
  `trackedQuantity-${wishlistId}-${cardId}`;

// Initializer function to read from localStorage synchronously on client
const getInitialQuantity = (wishlistId: string, cardId: string): number => {
  // Ensure this only runs on the client
  if (typeof window === 'undefined') {
    return 0;
  }
  const key = getLocalStorageKey(wishlistId, cardId);
  const storedValue = localStorage.getItem(key);
  if (storedValue !== null) {
    const parsedValue = parseInt(storedValue, 10);
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  return 0; // Default to 0 if not found or invalid
};

export const TrackedQuantityCounter = ({
  wishlistId,
  cardId,
  targetQuantity,
}: TrackedQuantityCounterProps) => {
  // Initialize state using the initializer function
  const [trackedQuantity, setTrackedQuantity] = useState(() =>
    getInitialQuantity(wishlistId, cardId),
  );

  // REMOVED: Effect to load quantity from localStorage on mount (now handled by initializer)

  // Effect to save quantity to localStorage when it changes
  useEffect(() => {
    // Save only on client
    if (typeof window !== 'undefined') {
      const key = getLocalStorageKey(wishlistId, cardId);
      localStorage.setItem(key, trackedQuantity.toString());
    }
  }, [trackedQuantity, wishlistId, cardId]);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click or other parent events
    setTrackedQuantity((prev) => prev + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click or other parent events
    setTrackedQuantity((prev) => Math.max(0, prev - 1)); // Don't go below 0
  };

  const isSufficient = trackedQuantity >= targetQuantity;

  return (
    <div className="flex items-center gap-2">
      {isSufficient ? (
        <Check className="h-5 w-5 text-green-400" />
      ) : (
        <X className="h-5 w-5 text-red-400" />
      )}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={handleIncrement}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <span className="text-sm font-semibold tabular-nums">
          {trackedQuantity}/{targetQuantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={handleDecrement}
          disabled={trackedQuantity <= 0}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
