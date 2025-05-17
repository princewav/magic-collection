import {
  loadWishlistById,
  loadWishlistCards,
  loadWishlistWithoutCards,
} from '@/actions/wishlist/load-wishlists';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditWishlistClient } from './EditWishlistClient';

interface EditWishlistPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Separate component for loading cards with Suspense
async function WishlistWithCards({ id }: { id: string }) {
  try {
    // Load the wishlist first
    const wishlistData = await loadWishlistWithoutCards(id);

    if (!wishlistData) {
      notFound();
    }

    // Then load the cards
    const wishlist = await loadWishlistCards(wishlistData);

    return <EditWishlistClient wishlist={wishlist} />;
  } catch (error) {
    console.error('Error loading wishlist:', error);
    throw error; // Let Next.js error boundary handle this
  }
}

function WishlistFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-full" />
          ))}
        </div>
      </div>

      <Skeleton className="h-10 w-28" />
    </div>
  );
}

export default async function EditWishlistPage({
  params,
}: EditWishlistPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto flex max-w-5xl flex-col p-4">
      <h1 className="mb-6 text-2xl font-bold">Edit Wishlist</h1>
      <Suspense fallback={<WishlistFormSkeleton />}>
        <WishlistWithCards id={id} />
      </Suspense>
    </main>
  );
}
