'use server';

import { revalidatePath } from 'next/cache';
import { deckService } from '@/db/services/DeckService';

export async function deleteDecks(ids: string[]) {
  try {
    await deckService.deleteMany(ids);
    console.debug('Decks deleted successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to delete decks',
    };
  }

  revalidatePath('/');
}
