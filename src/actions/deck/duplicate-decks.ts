'use server';

import { revalidatePath } from 'next/cache';
import { deckRepository } from '@/repositories/DeckRepository';

export async function duplicateDecks(ids: string[]) {
  try {
    await deckRepository.duplicateMany(ids);
    console.log('Decks duplicated successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to duplicate decks',
    };
  }
  revalidatePath('/');
}
