'use server';

import { revalidatePath } from 'next/cache';
import PouchDB from 'pouchdb';
import { Deck } from '@/types/deck';

const db = new PouchDB('decks');

export async function duplicateDeck(deckId: string): Promise<string> {
  try {
    const deck = await db.get<Deck>(deckId);
    if (deck.type !== 'deck') {
      throw new Error('Deck not found');
    }

    const { _id, _rev, ...newDeckData } = deck;
    const newDeck = {
      ...newDeckData,
      name: `Copy of ${deck.name}`,
    };

    const response = await db.post(newDeck);
    revalidatePath('/decks');
    return response.id;
  } catch (error: any) {
    console.error('Error duplicating deck:', error);
    throw new Error(`Failed to duplicate deck: ${error.message}`);
  }
}
