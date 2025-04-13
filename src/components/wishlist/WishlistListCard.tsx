'use client';

import { CardWithQuantity } from '@/types/card';
import { TextWithSymbols } from '@/components/card-modal/TextWithSymbols';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { updateCardQuantity } from '@/actions/wishlist/update-card-quantity';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistListCardProps {
  card: CardWithQuantity;
  onClick: () => void;
  wishlistId: string;
  className?: string;
}

export const WishlistListCard = ({
  card,
  onClick,
  wishlistId,
  className,
}: WishlistListCardProps) => {
  const [quantity, setQuantity] = useState(card.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);
    setQuantity(newQuantity); // Optimistic update

    try {
      const result = await updateCardQuantity(
        wishlistId,
        card.cardId,
        newQuantity,
      );

      if (!result.success) {
        // Revert the optimistic update if there was an error
        setQuantity(card.quantity);
        toast.error(result.message || 'Failed to update quantity');
      }
    } catch (error) {
      // Revert the optimistic update if there was an error
      setQuantity(card.quantity);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityButtonClick = (
    e: React.MouseEvent,
    newQuantity: number,
  ) => {
    e.stopPropagation();
    handleQuantityChange(newQuantity);
  };

  return (
    <div
      data-role="card-row"
      className={cn(
        'hover:bg-secondary/10 bg-card flex cursor-pointer items-center justify-between overflow-x-auto rounded-xl border p-1 px-3 shadow-sm',
        className,
      )}
    >
      <div data-role="card-info" className="flex w-full items-center gap-3">
        {/* Quantity Controls */}
        <div
          data-role="card-quantity-controls"
          className="flex flex-col items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => handleQuantityButtonClick(e, quantity + 1)}
            disabled={isUpdating}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>

          <div
            data-role="card-quantity"
            className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold"
          >
            {quantity}x
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) =>
              handleQuantityButtonClick(e, quantity > 1 ? quantity - 1 : 1)
            }
            disabled={isUpdating || quantity <= 1}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        {/* Card Image */}
        {card.image_uris?.art_crop && (
          <Image
            src={card.image_uris.art_crop}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-sm object-cover"
            onClick={onClick}
          />
        )}

        {/* Card Details */}
        <div className="flex flex-grow flex-col" onClick={onClick}>
          <div data-role="row-1">
            <span
              data-role="card-name"
              className="min-w-0 truncate font-medium"
            >
              {card.name}
            </span>
          </div>
          <div data-role="row-2" className="flex items-center gap-2">
            <span
              data-role="card-set"
              className="text-muted-foreground font-mono text-sm"
            >
              [{card.set.toUpperCase()}]
            </span>
            {card.mana_cost && (
              <p className="flex items-center">
                <TextWithSymbols
                  text={card.mana_cost}
                  symbolSize={18}
                  symbolClassName="mx-0.5"
                />
              </p>
            )}
          </div>
        </div>

        {/* Card Price */}
        {card.prices?.eur && (
          <div className="flex flex-col items-end" onClick={onClick}>
            <span className="text-sm font-semibold">€{card.prices?.eur}</span>
            <span className="text-muted-foreground truncate text-sm">
              Tot. €
              {(parseFloat(card.prices?.eur || '0') * quantity).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
