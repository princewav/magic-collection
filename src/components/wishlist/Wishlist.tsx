'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { ManaSymbol } from '@/components/ManaSymbol';
import { cn } from '@/lib/utils';
import { useWishlistSelection } from '@/context/WishlistSelectionContext';
import { Wishlist as WishlistType } from '@/types/wishlist';

interface WishlistProps {
  wishlist: WishlistType;
  onContextMenu: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    wishlistId: string,
  ) => void;
  className?: string;
}

export const Wishlist: React.FC<WishlistProps> = ({
  wishlist,
  onContextMenu,
  className,
}) => {
  const { selectedWishlists, toggleWishlistSelection } = useWishlistSelection();
  const isChecked = selectedWishlists.includes(wishlist.id);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, wishlist.id);
    },
    [wishlist.id, onContextMenu],
  );

  const handleCheckboxChange = useCallback(() => {
    toggleWishlistSelection(wishlist.id);
  }, [wishlist.id, toggleWishlistSelection]);

  return (
    <div
      key={wishlist.id}
      className={cn(
        'group bg-card hover:bg-card/90 border-muted relative isolate w-50 overflow-hidden rounded-lg border shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg',
        className,
        isChecked
          ? 'bg-foreground/10 hover:bg-foreground/20 scale-[1.06] hover:scale-[1.07]'
          : '',
      )}
    >
      <Checkbox
        id={`wishlist-${wishlist.id}`}
        className="border-secondary/50 text-primary focus:border-secondary focus:ring-secondary bg-foreground/30 absolute top-2 left-2 z-10 size-7 cursor-pointer rounded-full border-3 shadow-sm"
        checked={isChecked}
        onCheckedChange={handleCheckboxChange}
        stroke={3}
      />
      <Link
        href={`/wishlists/${wishlist.id}`}
        onContextMenu={handleContextMenu}
      >
        <div className="relative h-30 overflow-hidden">
          {wishlist.imageUrl ? (
            <Image
              src={wishlist.imageUrl}
              alt={wishlist.name}
              fill
              className="object-cover object-[80%_20%]"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold">{wishlist.name}</h3>
          <div className=" flex gap-2">
            {wishlist.colors.map((color, index) => (
              <ManaSymbol key={index} symbol={color} />
            ))}
          </div>
          <div className="text-muted-foreground mt-1 text-sm">
            {wishlist.cardCount} {wishlist.cardCount === 1 ? 'card' : 'cards'} •
            €{(wishlist.totalPrice ?? 0).toFixed(2)}
          </div>
        </div>
      </Link>
    </div>
  );
};
