'use client';

import { Wishlist } from '@/types/wishlist';
import Image from 'next/image';
import { ManaSymbol } from '@/components/ManaSymbol';
import { Card } from '@/components/Card';

interface Props {
  wishlist: Wishlist;
}

export const WishlistCardGrid = ({ wishlist }: Props) => {
  if (!wishlist.cards || wishlist.cards.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No cards in this wishlist</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {wishlist.cards.map((card) => (
        <Card
          key={card.cardId}
          card={card}
          className="sm:w-[min(100%,350px)] md:w-[min(100%,250px)] lg:w-[min(100%,200px)]"
        />
      ))}
    </div>
  );
};
