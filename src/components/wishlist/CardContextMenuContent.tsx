import React from 'react';
import {
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';
import { Trash2 } from 'lucide-react';

interface CardContextMenuContentProps {
  wishlistId: string;
  cardId: string;
  onRemoveCard: (wishlistId: string, cardId: string) => void;
}

export const CardContextMenuContent = ({
  wishlistId,
  cardId,
  onRemoveCard,
}: CardContextMenuContentProps) => {
  const handleRemove = () => {
    onRemoveCard(wishlistId, cardId);
  };

  return (
    <ContextMenuContent>
      {/* Using variant destructive based on user changes */}
      <ContextMenuItem onClick={handleRemove} variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Remove
      </ContextMenuItem>
      {/* Future card actions can be added here */}
    </ContextMenuContent>
  );
};
