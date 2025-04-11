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
    <div className="bg-foreground/10 relative mb-4 flex items-center justify-between overflow-hidden rounded-md p-4 shadow-md min-w-[370px]">
      <Image
        src={wishlist.imageUrl || '/placeholder-wishlist.jpg'}
        alt={wishlist.name}
        width={1500}
        height={1000}
        className="absolute inset-0 -z-10 rounded-md object-cover object-center opacity-30 md:hidden"
      />
      <div className="flex items-center space-x-4">
        <Image
          src={wishlist.imageUrl || '/placeholder-wishlist.jpg'}
          alt={wishlist.name}
          width={150}
          height={100}
          className="hidden rounded-md md:block"
        />
        <div>
          <h2 className="drop-shadow-black text-2xl font-semibold drop-shadow-xl">
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
          <Button className="">
            <Edit className="h-4 w-4 md:mr-2" />
            <span className="hidden md:block">Edit Wishlist</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
