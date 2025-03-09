import { loadCardsById } from '@/actions/load-cards';

import { Deck, DeckCard } from '@/types/deck';
import { Card } from './Card';
import { defaultSort } from '@/lib/deck/sorting';
import { Card as CardType } from '@/types/card';

interface Props {
  decklist?: DeckCard[];
}

interface CardWithQuantity extends CardType {
  quantity: number;
}

export async function DeckCardGrid({ decklist }: Props) {
  const cardIds: string[] = decklist?.map((card) => card.id) || [];
  const cards = await loadCardsById(cardIds);
  const sortedCards = defaultSort(cards);
  const cardsWithQuantity: CardWithQuantity[] = sortedCards.map(
    (card: CardType) => ({
      ...card,
      quantity: decklist?.find((c) => c.id === card.id)?.quantity || 0,
    }),
  );

  return (
    <div className="mx-auto flex flex-wrap gap-3">
      {cardsWithQuantity?.map((card: CardWithQuantity) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
}
