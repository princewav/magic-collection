import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';
import { loadWishlists } from '@/actions/wishlist/load-wishlists';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WishlistsHeader } from '@/components/wishlist/WishlistsHeader';

export const metadata: Metadata = {
  title: 'Wishlists',
  description: 'Manage your Magic: The Gathering wishlists.',
};

function WishlistGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );
}

// Async component to load wishlists with suspense
async function WishlistsContent() {
  try {
    const wishlists = await loadWishlists();

    return (
      <>
        <WishlistGrid wishlists={wishlists} />
        {wishlists.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-xl">No wishlists yet</p>
            <Button asChild className="mt-4">
              <Link href="/wishlists/new">Create Wishlist</Link>
            </Button>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('Error loading wishlists:', error);
    throw error;
  }
}

export default function WishlistPage() {
  return (
    <main className="container mx-auto flex flex-col p-6">
      <WishlistsHeader />

      <Suspense fallback={<WishlistGridSkeleton />}>
        <WishlistsContent />
      </Suspense>
    </main>
  );
}
