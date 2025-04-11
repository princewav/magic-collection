import { loadWishlistById } from '@/actions/wishlist/load-wishlists';
import { WishlistInfo } from '@/components/wishlist/WishlistInfo';
import { WishlistCardGrid } from '@/components/wishlist/WishlistCardGrid';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[theme(spacing.16)_1fr_theme(spacing.16)]">
      <div className="hidden md:flex md:flex-col md:items-center md:justify-start md:pt-4">
        <Link
          href={`/wishlists`}
          className="flex flex-col items-center justify-center gap-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 gap-2 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground text-xs text-center truncate">To wishlists</span>
        </Link>
      </div>

      <main className="container mx-auto">
        <div className="flex justify-start md:hidden">
          <Link
            href={`/wishlists`}
            className="mb-2 flex items-center justify-center gap-1"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-muted-foreground text-xs">
                To wishlists
              </span>
            </Button>
          </Link>
        </div>
        <WishlistInfo wishlist={wishlist} />
        <WishlistCardGrid wishlist={wishlist} />
      </main>

      <div className="hidden md:block"></div>
    </div>
  );
}
