'use server';

import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { deckService } from '@/db/services/DeckService';
import { revalidatePath } from 'next/cache';

export const createDeck = async (values: z.infer<typeof deckSchema>) => {
  try {
    const deck = await deckService.repo.create({
      ...values,
      id: '',
      type: values.type,
      imageUrl: values.imageUrl ?? null,
      format: values.format ?? undefined,
      colors: values.colors,
      maindeck: [],
      sideboard: [],
      maybeboard: [],
    });
    revalidatePath(`/decks/${values.type}`);
    return deck;
  } catch (error) {
    console.error('Error creating deck:', error);
    throw new Error('Failed to create deck');
  }
};
