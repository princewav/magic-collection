'use server';

import { revalidatePath } from 'next/cache';
import PouchDB from 'pouchdb';
import { Deck } from '@/types/deck';

const db = new PouchDB<Deck>('decks');

export async function deleteDecks(ids: string[]) {
  try {
    const response = await db.find({
      selector: {
        _id: { $in: ids },
        type: 'deck',
      },
    });

    await Promise.all(
      response.docs.map(async (deck) => {
        await db.remove(deck);
      }),
    );
    console.log('Decks deleted successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to delete decks',
    };
  }

  revalidatePath('/');
}
