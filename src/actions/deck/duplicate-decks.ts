'use server';

import { revalidatePath } from 'next/cache';
import { deckService } from '@/db/services/DeckService';

export async function duplicateDecks(ids: string[]) {
  try {
    await deckService.duplicateMany(ids);
    console.debug('Decks duplicated successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to duplicate decks',
    };
  }
  revalidatePath('/');
}
