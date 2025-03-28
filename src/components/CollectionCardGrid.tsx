import { Card as CardType } from '@/types/card';
import { Card } from './Card';

interface Props {
  cards?: (CardType & { quantity: number })[];
}
export async function CollectionCardGrid({ cards }: Props) {
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4">
        {cards?.map((card) => (
          <Card key={card.id} card={card} collectedQuantity={card.quantity} />
        ))}
      </div>
    </div>
  );
}
