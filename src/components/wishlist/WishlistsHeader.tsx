'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function WishlistsHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold">WISHLISTS</h1>
      <div className="flex gap-2">
        <Button asChild className="flex items-center gap-2">
          <Link href="/wishlists/new">
            <Plus className="size-4" />
            <span>Create Wishlist</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
