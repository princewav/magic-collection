import {
  loadWishlistById,
  loadWishlistWithoutCards,
  loadWishlistCards,
} from '@/actions/wishlist/load-wishlists';
import { WishlistInfo } from '@/components/wishlist/WishlistInfo';
import { WishlistCardGrid } from '@/components/wishlist/WishlistCardGrid';
import { WishlistPriceChart } from '@/components/wishlist/WishlistPriceChart';
import { WishlistHeader } from '@/components/wishlist/WishlistHeader';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface WishlistPageProps {
  params: Promise<{
    id: string;
  }>;
}

function WishlistInfoSkeleton() {
  return (
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
  );
}

function WishlistCardGridSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="mb-4 h-7 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function WishlistPriceChartSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="mb-4 h-7 w-32" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

// Component to load basic wishlist info
async function BasicWishlistInfo({ id }: { id: string }) {
  try {
    const wishlist = await loadWishlistById(id);

    if (!wishlist) {
      notFound();
    }

    return <WishlistInfo wishlist={wishlist} />;
  } catch (error) {
    console.error('Error loading wishlist info:', error);
    throw error;
  }
}

// Component to load cards with suspense
async function WishlistCards({ id }: { id: string }) {
  try {
    const wishlist = await loadWishlistById(id);

    if (!wishlist) {
      notFound();
    }

    return <WishlistCardGrid wishlist={wishlist} />;
  } catch (error) {
    console.error('Error loading wishlist cards:', error);
    throw error;
  }
}

// Component to load price chart with suspense
async function WishlistPrice({ id }: { id: string }) {
  try {
    const wishlist = await loadWishlistById(id);

    if (!wishlist) {
      notFound();
    }

    return <WishlistPriceChart wishlist={wishlist} />;
  } catch (error) {
    console.error('Error loading wishlist price chart:', error);
    throw error;
  }
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { id } = await params;

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[theme(spacing.16)_1fr_theme(spacing.16)]">
      <WishlistHeader />

      <main className="container mx-auto">
        <Suspense fallback={<WishlistInfoSkeleton />}>
          <BasicWishlistInfo id={id} />
        </Suspense>

        <Suspense fallback={<WishlistCardGridSkeleton />}>
          <WishlistCards id={id} />
        </Suspense>

        <Suspense fallback={<WishlistPriceChartSkeleton />}>
          <WishlistPrice id={id} />
        </Suspense>
      </main>

      <div className="hidden md:block"></div>
    </div>
  );
}
