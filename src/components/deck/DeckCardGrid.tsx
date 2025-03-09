import { loadCardsById } from '@/actions/load-cards';

import { Deck, DeckCard } from '@/types/deck';
import { Card } from '../Card';
import { defaultSort } from '@/lib/deck/sorting';
import { Card as CardType } from '@/types/card';
import Image from 'next/image';

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

  const rarityTotals = cardsWithQuantity.reduce(
    (acc, card) => {
      const rarity = card.rarity || 'Common';
      if (!acc[rarity]) {
        acc[rarity] = 0;
      }
      acc[rarity] += card.quantity || 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <div className="right-0 flex items-center gap-3 mb-2">
        <p className="flex items-center gap-1">
          <Image
            src="/images/rarities/common.png"
            alt="Common"
            width={32}
            height={32}
          />
          {rarityTotals.common || 0}
        </p>
        <p className="flex items-center gap-1">
          <Image
            src="/images/rarities/uncommon.png"
            alt="Uncommon"
            width={32}
            height={32}
          />
          {rarityTotals.uncommon || 0}
        </p>
        <p className="flex items-center gap-1">
          <Image
            src="/images/rarities/rare.png"
            alt="Rare"
            width={32}
            height={32}
          />
          {rarityTotals.rare || 0}
        </p>
        <p className="flex items-center gap-1">
          <Image
            src="/images/rarities/mythic.png"
            alt="Mythic"
            width={32}
            height={32}
          />
          {rarityTotals.mythic || 0}
        </p>
      </div>

      <div className="mx-auto flex flex-wrap gap-3">
        {cardsWithQuantity?.map((card: CardWithQuantity) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </>
  );
}
