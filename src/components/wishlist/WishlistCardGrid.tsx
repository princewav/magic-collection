'use client';

import { Wishlist } from '@/types/wishlist';
import Image from 'next/image';
import { ManaSymbol } from '@/components/ManaSymbol';
import { Card } from '@/components/Card';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Grid2X2, List } from 'lucide-react';
import { TextWithSymbols } from '@/components/card-modal/TextWithSymbols';

interface Props {
  wishlist: Wishlist;
}

export const WishlistCardGrid = ({ wishlist }: Props) => {
  const [isGridView, setIsGridView] = useState(true);

  // Load layout preference from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('wishlistLayout');
    if (savedLayout) {
      setIsGridView(savedLayout === 'grid');
    }
  }, []);

  // Save layout preference
  const toggleLayout = () => {
    const newLayout = !isGridView;
    setIsGridView(newLayout);
    localStorage.setItem('wishlistLayout', newLayout ? 'grid' : 'list');
  };

  if (!wishlist.cards || wishlist.cards.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No cards in this wishlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleLayout}
          className="h-8 w-8"
          title={isGridView ? 'Switch to list view' : 'Switch to grid view'}
        >
          {isGridView ? (
            <List className="h-4 w-4" />
          ) : (
            <Grid2X2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isGridView ? (
        <div className="flex flex-wrap gap-4">
          {wishlist.cards.map((card) => (
            <Card
              key={card.cardId}
              card={card}
              className="sm:w-[min(100%,350px)] md:w-[min(100%,250px)] lg:w-[min(100%,200px)]"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {wishlist.cards.map((card) => (
            <div
              key={card.cardId}
              className="bg-card flex items-center justify-between rounded-lg border p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-background/80 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                  {card.quantity}x
                </div>
                <span className="font-medium">{card.name}</span>
                <span className="text-muted-foreground text-sm">
                  [{card.set.toUpperCase()}]
                </span>
              </div>
              {card.mana_cost && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <TextWithSymbols
                      text={card.mana_cost}
                      symbolSize={16}
                      symbolClassName="mx-0.5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      CMC: {card.cmc}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
