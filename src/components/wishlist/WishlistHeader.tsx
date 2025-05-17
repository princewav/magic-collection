'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function WishlistHeader() {
  return (
    <>
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
          <span className="text-muted-foreground truncate text-center text-xs">
            To wishlists
          </span>
        </Link>
      </div>

      <div className="flex justify-start md:hidden">
        <Link
          href={`/wishlists`}
          className="mb-2 flex items-center justify-center gap-1"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-muted-foreground text-xs">To wishlists</span>
          </Button>
        </Link>
      </div>
    </>
  );
}
