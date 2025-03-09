import { z } from 'zod';
import { parseDeckList, ParsedCard } from '@/lib/deck/list-parser';
import { cardService } from '@/db/services/CardService';
import { deckService } from '@/db/services/DeckService';
import { DeckCard } from '@/types/deck';

type ImportDeckResult = {
  success: boolean;
  message?: string;
};

const importDeckSchema = z.object({
  cardList: z.string().min(1, 'Card list cannot be empty'),
});

async function convertNameToId(card: ParsedCard): Promise<DeckCard | null> {
  const cardData = await cardService.getByNameAndSet(card.name, card.set);
  if (!cardData || cardData.length === 0) {
    console.log(`Card not found: ${card.name} (${card.set})`);
    return null;
  }
  return {
    id: cardData[0].id,
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
    const { mainDeck, sideboard } = parseDeckList(
      importDeckSchema.parse({ cardList }).cardList,
    );

    const [mainDeckCards, sideboardCards] = await Promise.all([
      Promise.all(mainDeck.map(convertNameToId)).then(
        (cards) => cards.filter(Boolean) as DeckCard[],
      ),
      Promise.all(sideboard.map(convertNameToId)).then(
        (cards) => cards.filter(Boolean) as DeckCard[],
      ),
    ]);


    if (
      mainDeckCards.length !== mainDeck.length ||
      sideboardCards.length !== sideboard.length
    ) {
      return {
        success: false,
        message: 'Failed to convert some card names to IDs',
      };
    }

    await deckService.repo.update(deckId, {
      maindeck: mainDeckCards,
      sideboard: sideboardCards,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
