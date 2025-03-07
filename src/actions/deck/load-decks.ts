import PouchDB from 'pouchdb';
import { Deck } from '@/types/deck';

const db = new PouchDB('decks');

export async function getDeckById(id: string): Promise<Deck | null> {
  try {
    const deck = await db.get<Deck>(id);
    if (deck.type !== 'deck') return null;

    return deck;
  } catch (error) {
    console.error('Error fetching deck:', error);
    return null;
  }
}

export async function getDecks(): Promise<Deck[]> {
  try {
    const result = await db.allDocs<Deck>({
      include_docs: true,
    });
    return result.rows
      .map((row) => row.doc as Deck | undefined)
      .filter((doc): doc is Deck => doc !== undefined && doc.type === 'deck');
  } catch (error) {
    console.error('Error fetching decks:', error);
    return [];
  }
}
