'use client';

import Image from 'next/image';
import { Wishlist } from '@/types/wishlist';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Heart, Clipboard } from 'lucide-react';
import { ManaSymbol } from '@/components/ManaSymbol';
import { toast } from 'sonner';

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

  const totalQuantity = wishlist.cards.reduce((acc, card) => {
    return acc + card.quantity;
  }, 0);

  const totalPrice = wishlist.cards.reduce((acc, card) => {
    return acc + parseFloat(card.prices.eur || '0') * card.quantity;
  }, 0);

  const handleCopyToClipboard = () => {
    const formattedCards = wishlist.cards
      .map((card) => `${card.quantity}x ${card.name}`)
      .join('\n');
    navigator.clipboard.writeText(formattedCards);
    toast.success('Wishlist copied to clipboard');
  };

  return (
    <div className="bg-foreground/10 relative mb-4 flex min-w-[370px] items-center justify-between overflow-hidden rounded-md p-4 shadow-md">
      <Image
        src={wishlist.imageUrl || '/placeholder-wishlist.jpg'}
        alt={wishlist.name}
        width={1500}
        height={1000}
        className="absolute inset-0 -z-10 rounded-md object-cover object-center opacity-20 md:hidden"
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
          <h2 className="drop-shadow-black flex items-center gap-2 text-lg font-semibold drop-shadow-xl md:text-2xl">
            <Heart
              className="inline-block size-4 -translate-y-[1px]"
              fill="currentColor"
            />
            {wishlist.name}{' '}
          </h2>
          <div className="mt-1 mb-2 flex items-center space-x-1">
            {Array.isArray(colors) && colors.length > 0
              ? colors.map((color) => (
                  <ManaSymbol
                    key={color}
                    symbol={color}
                    className="size-4 md:size-5"
                  />
                ))
              : 'None'}
          </div>
          <p className="text-sm">Cards: {totalQuantity}</p>
          <p className="text-sm">Price: €{totalPrice.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between space-y-2">
        <div className="flex flex-col items-end justify-between space-y-2">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            className="md:w-40"
          >
            <Clipboard className="h-4 w-4" />
            <span className="hidden md:block">Copy List</span>
          </Button>
          <Link href={`/wishlists/${wishlist.id}/edit`}>
            <Button className="md:w-40">
              <Edit className="h-4 w-4" />
              <span className="hidden md:block">Edit Wishlist</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
