import { z } from 'zod';
import { parseDeckList } from '@/lib/deck/list-parser';

type ImportDeckResult = {
  success: boolean;
  message?: string;
};

const ImportDeckSchema = z.object({
  deckId: z.string(),
  cardList: z.string().min(1, 'Card list cannot be empty'),
});

export async function importDeckList(
  deckId: string,
  cardList: string,
): Promise<ImportDeckResult> {
  try {
    const validatedData = ImportDeckSchema.parse({ deckId, cardList });

    const deckList = parseDeckList(validatedData.cardList);
    console.log(deckList);

    // TODO: Implement import logic
    // Process deckList and update deck with validatedData.deckId

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'An unexpected error occurred' };
  }
}
