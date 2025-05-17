'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { WishlistsHeader } from '@/components/wishlist/WishlistsHeader';

export default function Loading() {
  return (
    <main className="container mx-auto flex flex-col p-6">
      <WishlistsHeader />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
