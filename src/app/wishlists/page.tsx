import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';
import { loadWishlists } from '@/actions/wishlist/load-wishlists';

export const metadata: Metadata = {
  title: 'Wishlists',
  description: 'Manage your Magic: The Gathering wishlists.',
};

export default async function WishlistPage() {
  const wishlists = await loadWishlists();

  return (
    <main className="flex flex-col p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Wishlists</h1>
        <div className="flex gap-2">
          <Button asChild className="flex items-center gap-2">
            <Link href="/wishlists/new">
              <span>Create Wishlist</span>
            </Link>
          </Button>
        </div>
      </div>

      <WishlistGrid wishlists={wishlists} />
      {wishlists.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xl">No wishlists yet</p>
          <Button asChild className="mt-4">
            <Link href="/wishlists/new">Create Wishlist</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
