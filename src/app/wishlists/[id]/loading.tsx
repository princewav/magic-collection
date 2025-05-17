'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { WishlistHeader } from '@/components/wishlist/WishlistHeader';

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[theme(spacing.16)_1fr_theme(spacing.16)]">
      <WishlistHeader />

      <main className="container mx-auto">
        {/* Wishlist Info Skeleton */}
        <div className="bg-card mb-6 space-y-4 rounded-lg border p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-full" />
            ))}
          </div>
        </div>

        {/* Card Grid Skeleton */}
        <div className="mb-6">
          <Skeleton className="mb-4 h-7 w-32" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Price Chart Skeleton */}
        <div className="mb-6">
          <Skeleton className="mb-4 h-7 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </main>

      <div className="hidden md:block"></div>
    </div>
  );
}
