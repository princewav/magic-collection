import { CardWithQuantity } from '@/types/card';
import { Card } from '@/components/Card';

interface WishlistGridCardProps {
  card: CardWithQuantity;
  onClick: () => void;
}

export const WishlistGridCard = ({ card, onClick }: WishlistGridCardProps) => {
  return (
    <Card
      key={card.cardId}
      card={card}
      onClick={onClick}
      className="mx-auto mb-4 w-full max-w-[320px] sm:mb-0"
    />
  );
};
