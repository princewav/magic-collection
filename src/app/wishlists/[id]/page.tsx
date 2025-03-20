import { loadWishlistById } from '@/actions/wishlist/load-wishlists';
import { WishlistInfo } from '@/components/wishlist/WishlistInfo';
import { WishlistCardGrid } from '@/components/wishlist/WishlistCardGrid';
import { notFound } from 'next/navigation';

interface WishlistPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { id } = await params;
  const wishlist = await loadWishlistById(id);

  if (!wishlist) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col p-4">
      <WishlistInfo wishlist={wishlist} />
      <WishlistCardGrid wishlist={wishlist} />
    </main>
  );
}
