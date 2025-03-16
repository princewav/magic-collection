import { loadCardsById } from '@/actions/load-cards';
import { Card as CardType } from '@/types/card';
import { defaultSort } from '@/lib/deck/sorting';
import Image from 'next/image';
import { Card } from '../Card';
import { CardWithQuantity } from '@/types/card';

interface Props {
  decklist?: (CardWithQuantity)[];
  collectedCards?: { name: string; quantity: number }[];
  type: 'paper' | 'arena';
}



export async function DeckCardGrid({ decklist, collectedCards }: Props) {
  const cardIds: string[] =
    decklist?.map((card) => card.cardId).filter(Boolean) || [];
  const cards = await loadCardsById(cardIds);
  const sortedCards = defaultSort(cards);
  const cardsWithQuantity: CardWithQuantity[] = sortedCards.map(
    (card: CardType) => ({
      ...card,
      quantity: decklist?.find((c) => c.cardId === card.cardId)?.quantity || 0,
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
        <div className="right-0 mb-2 flex items-center gap-3">
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

      <div className="mx-auto flex flex-wrap gap-3 mt-2">
        {cardsWithQuantity?.map((card: CardWithQuantity) => (
          <Card
            key={card.id}
            card={card}
            collectedQuantity={
              collectedCards?.find((c) => c.name === card.name)?.quantity || 0
            }
          />
        ))}
      </div>
    </>
  );
}
