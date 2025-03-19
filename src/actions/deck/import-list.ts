import { z } from 'zod';
import { parseDeckList, ParsedCard } from '@/lib/deck/list-parser';
import { cardService } from '@/db/services/CardService';
import { deckService } from '@/db/services/DeckService';
import { Deck, DeckCard } from '@/types/deck';
import { CardWithQuantity } from '@/types/card';

type ImportDeckResult = {
  success: boolean;
  errors?: string[];
};

const importDeckSchema = z.object({
  cardList: z.string().min(1, 'Card list cannot be empty'),
});

async function convertNameToId(card: ParsedCard): Promise<DeckCard | null> {
  const cardData = await (card.set
    ? cardService.getByNameAndSet(card.name, card.set)
    : cardService.getByName(card.name));

  if (!cardData || cardData.length === 0) {
    console.error(`Card not found: ${card.name} (${card.set})`);
    return null;
  }
  return {
    cardId: cardData[0].cardId,
    name: cardData[0].name,
    set: card.set,
    quantity: card.quantity,
    setNumber: card.setNumber,
  };
}

export async function importDeckList(
  deckId: string,
  cardList: string,
): Promise<ImportDeckResult> {
  try {
    const { mainDeck, sideboard, errors } = parseDeckList(
      importDeckSchema.parse({ cardList }).cardList,
    );

    const convertDeckCards = async (deck: ParsedCard[]) => {
      return Promise.all(deck.map(convertNameToId)).then(
        (cards) => cards.filter(Boolean) as DeckCard[],
      );
    };

    const [mainDeckCards, sideboardCards] = await Promise.all([
      convertDeckCards(mainDeck),
      convertDeckCards(sideboard),
    ]);

    await deckService.repo.update(deckId, {
      maindeck: mainDeckCards,
      sideboard: sideboardCards,
    });

    return { success: true, errors };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

export function generateDecklist(deck: Deck): string {
  const formatCard = (card: CardWithQuantity) => {
    return `${card.quantity} ${card.name} (${card.set.toUpperCase()})`;
  };

  const mainDeckList = deck.maindeck.map(formatCard).join('\n');
  const sideboardList = deck.sideboard.map(formatCard).join('\n');

  return `Deck\n${mainDeckList}\n\nSideboard\n${sideboardList}`;
}
