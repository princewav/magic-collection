import { CARD_DATA_PATH } from '../../lib/constants';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../BaseRepository';

interface Card {
  id: string;
  name: string;
  type: string;
  // Add other properties as needed
}

async function fetchCards(): Promise<Card[]> {
  // Read the JSON file
  const filePath = fileURLToPath(
    new URL(`../../${CARD_DATA_PATH}`, import.meta.url),
  );
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const cards = JSON.parse(rawData);
  return cards.map((card: Card) => ({ _id: card.id, ...card }));
}

async function populateCardsCollection() {
  try {
    const cards = await fetchCards();
    // const db = new PouchDB(process.env.COUCHDB_URL + '/magic');
    for (const card of cards) {
      const existingDoc = await db.get(card.id).catch(() => null);
      if (!existingDoc) {
        await db.put(card);
      }
    }
    console.log('Cards collection populated successfully');
  } catch (error) {
    console.error('Error populating cards collection:', error);
  }
}

populateCardsCollection();
