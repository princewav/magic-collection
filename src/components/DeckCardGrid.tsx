import { loadCardsById } from '@/actions/load-cards';

import { Deck } from '@/types/deck';
import Card from './Card';

interface Props {
  deck?: Deck;
}
export async function DeckCardGrid({ deck }: Props) {
  const cardIds: string[] = deck?.maindeck?.map((card) => card.id) || [];
  const cards = await loadCardsById(cardIds);
  const cardsWithQuantity = cards.map((card) => ({
    ...card,
    quantity: deck?.maindeck?.find((c) => c.id === card.id)?.quantity || 0,
  }));

  return (
    <div className="mx-auto flex flex-wrap gap-2">
      {cardsWithQuantity?.map((card) => <Card key={card.id} card={card} />)}
    </div>
  );
}
