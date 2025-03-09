'use server';

import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { deckService } from '@/db/services/DeckService';
import { revalidatePath } from 'next/cache';

export const updateDeck = async (id: string, values: z.infer<typeof deckSchema>) => {
  try {
    const deck = await deckService.repo.update(id, {
      ...values,
      imageUrl: values.imageUrl ?? null,
      format: values.format ?? undefined,
    });
    revalidatePath('/decks');
    return deck;
  } catch (error) {
    console.error('Error updating deck:', error);
    throw new Error('Failed to update deck');
  }
};
