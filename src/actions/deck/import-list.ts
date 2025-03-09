import { z } from 'zod';
import { parseDeckList, ParsedCard } from '@/lib/deck/list-parser';
import { cardService } from '@/db/services/CardService';

type ImportDeckResult = {
  success: boolean;
  message?: string;
};

const ImportDeckSchema = z.object({
  deckId: z.string(),
  cardList: z.string().min(1, 'Card list cannot be empty'),
});

async function convertNameToId(card: ParsedCard) {
  const cardData = await cardService.getByNameAndSet(card.name, card.set)
  const cardInfo = cardData && cardData.length > 0 ? {id: cardData[0].id} : {}
  if (!cardInfo) {
    return { success: false, message: `Card "${card.name}" not found` };
  }
  const { name, ...restOfCard} = card;
  return { ...restOfCard, id: cardInfo.id };
}

export async function importDeckList(
  deckId: string,
  cardList: string,
): Promise<ImportDeckResult> {
  try {
    const validatedData = ImportDeckSchema.parse({ deckId, cardList });

    const deckList = parseDeckList(validatedData.cardList);

    const convertedCards = await Promise.all(deckList.mainDeck.map(card => convertNameToId(card)));
    console.log(convertedCards);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'An unexpected error occurred' };
  }
}
