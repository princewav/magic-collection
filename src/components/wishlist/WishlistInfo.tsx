'use client';

import Image from 'next/image';
import { Wishlist } from '@/types/wishlist';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { ManaSymbol } from '@/components/ManaSymbol';

interface Props {
  wishlist: Wishlist;
}

export const WishlistInfo = ({ wishlist }: Props) => {
  const getColors = () => {
    if (!wishlist.colors) return [];

    if (typeof wishlist.colors === 'string') {
      try {
        return JSON.parse(wishlist.colors as string);
      } catch {
        return [wishlist.colors];
      }
    }

    if (Array.isArray(wishlist.colors)) {
      return wishlist.colors;
    }

    return [];
  };

  const colors = getColors();

  return (
    <div className="bg-foreground/10 mb-4 flex items-center justify-between rounded-md p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <Image
          src={wishlist.imageUrl || '/placeholder-wishlist.jpg'}
          alt={wishlist.name}
          width={150}
          height={100}
          className="rounded-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">
            {wishlist.name}{' '}
            <div className="mt-1 mb-2 flex items-center space-x-1">
              {Array.isArray(colors) && colors.length > 0
                ? colors.map((color) => (
                    <ManaSymbol key={color} symbol={color} size={20} />
                  ))
                : 'None'}
            </div>
          </h2>
          <p className="text-sm">Cards: {wishlist.cardCount}</p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between space-y-2">
        <Link href={`/wishlists/${wishlist.id}/edit`}>
          <Button className="w-40">
            <Edit className="mr-2 h-4 w-4" />
            Edit Wishlist
          </Button>
        </Link>
      </div>
    </div>
  );
};
