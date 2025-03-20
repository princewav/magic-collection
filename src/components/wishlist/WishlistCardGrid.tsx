'use client';

import { Wishlist } from '@/types/wishlist';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { ManaSymbol } from '@/components/ManaSymbol';

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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {wishlist.cards.map((card) => (
        <Card key={card.cardId} className="overflow-hidden">
          <div className="relative aspect-[2/3]">
            <Image
              src={card.image_uris.normal || '/placeholder-card.jpg'}
              alt={card.name}
              fill
              className="object-cover"
            />
            {card.quantity > 1 && (
              <div className="bg-background/80 absolute top-2 right-2 rounded-full px-2 py-1 text-sm font-semibold">
                x{card.quantity}
              </div>
            )}
          </div>
          <div className="p-2">
            <h3 className="font-medium">{card.name}</h3>
            <div className="mt-1 flex items-center space-x-1">
              {card.colors?.map((color) => (
                <ManaSymbol key={color} symbol={color} size={16} />
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
