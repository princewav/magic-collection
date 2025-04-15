import { CardWithQuantity } from '@/types/card';
import { Card } from '@/components/Card';
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2 } from 'lucide-react';
import { CardContextMenuContent } from './CardContextMenuContent';

interface WishlistGridCardProps {
  card: CardWithQuantity;
  onClick: () => void;
  wishlistId: string;
  onRemoveCard: (wishlistId: string, cardId: string) => void;
}

export const WishlistGridCard = ({
  card,
  onClick,
  wishlistId,
  onRemoveCard,
}: WishlistGridCardProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          key={card.cardId}
          card={card}
          onClick={onClick}
          className="mx-auto mb-4 w-full max-w-[320px] sm:mb-0"
        />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <CardContextMenuContent
          wishlistId={wishlistId}
          cardId={card.cardId}
          onRemoveCard={onRemoveCard}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
};
