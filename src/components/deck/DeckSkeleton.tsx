'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DeckSkeleton() {
  return (
    <div className="container mx-auto p-4">
      {/* Deck Info Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Main Deck Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[330px] w-[240px] rounded-lg" />
          ))}
        </div>
      </div>

      {/* Sideboard Skeleton */}
      <div>
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[330px] w-[240px] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
