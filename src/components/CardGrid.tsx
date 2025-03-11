import { Card as CardType } from '@/types/card';
import { Card } from './Card';
import { CollectionCard } from '@/types/card';

interface Props {
  cards?: (CardType & CollectionCard)[];
}
export async function CardGrid({ cards }: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-4">
          {cards?.map((card) => (
            <Card key={card.id} card={card} />
          ))}
      </div>
    </div>
  );
}
