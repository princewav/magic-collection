'use client';

import { Wishlist } from '@/types/wishlist';
import { Card } from '@/components/Card';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Grid2X2, List } from 'lucide-react';
import { TextWithSymbols } from '@/components/card-modal/TextWithSymbols';
import { useCardModal } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import { groupCardsByType } from '@/lib/deck/utils';
import { CardWithQuantity } from '@/types/card';
import Image from 'next/image';

interface Props {
  wishlist: Wishlist;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const WishlistCardGrid = ({ wishlist }: Props) => {
  const [isGridView, setIsGridView] = useState(true);
  const [groupedCards, setGroupedCards] = useState<
    Record<string, CardWithQuantity[]>
  >({});
  const { openModal } = useCardModal();

  useEffect(() => {
    const savedLayout = localStorage.getItem('wishlistLayout');
    if (savedLayout) {
      setIsGridView(savedLayout === 'grid');
    }
  }, []);

  useEffect(() => {
    if (wishlist && wishlist.cards) {
      const sortedCards = [...wishlist.cards].sort((a, b) => {
        const isLandA = a.type_line?.toLowerCase().includes('land') || false;
        const isLandB = b.type_line?.toLowerCase().includes('land') || false;
        if (isLandA !== isLandB) return isLandA ? 1 : -1;
        const colorA = (a.colors || []).join('');
        const colorB = (b.colors || []).join('');
        if (colorA !== colorB) return colorA.localeCompare(colorB);
        if (a.cmc !== b.cmc) return a.cmc - b.cmc;
        return a.name.localeCompare(b.name);
      });
      const groups = groupCardsByType(sortedCards);
      setGroupedCards(groups);
    } else {
      setGroupedCards({});
    }
  }, [wishlist]);

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
        <div className="space-y-6 px-6 sm:px-0">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => (
            <div key={groupName}>
              <h2 className="mb-3 text-lg font-semibold capitalize">
                {capitalize(groupName)} (
                {cardsInGroup.reduce(
                  (sum, card) => sum + (card.quantity || 0),
                  0,
                )}
                )
              </h2>
              <div className="relative justify-start gap-4 sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(200px,250px))] sm:space-y-0">
                {cardsInGroup.map((card) => (
                  <Card
                    key={card.cardId}
                    card={card}
                    onClick={() => openModal(card, wishlist.cards)}
                    className="mx-auto mb-4 w-full max-w-[320px] sm:mb-0"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Object.entries(groupedCards).map(([groupName, cardsInGroup]) => (
            <div key={groupName}>
              <h2 className="text-md mb-2 font-semibold capitalize">
                {capitalize(groupName)} (
                {cardsInGroup.reduce(
                  (sum, card) => sum + (card.quantity || 0),
                  0,
                )}
                )
              </h2>
              <div className="space-y-2">
                {cardsInGroup.map((card) => (
                  <div
                    key={card.cardId}
                    onClick={() => openModal(card, wishlist.cards)}
                    className="hover:bg-accent/5 bg-card flex cursor-pointer items-center justify-between overflow-x-auto rounded-xl border p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-background/80 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                        {card.quantity}x
                      </div>
                      {card.image_uris?.art_crop && (
                        <Image
                          src={card.image_uris.art_crop}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-sm object-cover"
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {card.name}
                      </span>
                      <span className="text-muted-foreground hidden sm:inline text-sm ">
                        [{card.set.toUpperCase()}]
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-4 ml-2">
                      {card.mana_cost && (
                        <div className="flex items-center">
                          <TextWithSymbols
                            text={card.mana_cost}
                            symbolSize={20}
                            symbolClassName="mx-0.5"
                          />
                        </div>
                      )}
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <CardModal />
    </div>
  );
};
