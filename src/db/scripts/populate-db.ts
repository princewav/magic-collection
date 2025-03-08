import fs from 'fs';
import { DB } from '../db';
import { ObjectId } from 'mongodb';

interface Card {
  id: string;
  name: string;
  type: string;
  // Add other properties as needed
}

interface MongoCard extends Card {
  _id: ObjectId;
}

async function fetchCards(): Promise<MongoCard[]> {
  const filePath = new URL('../../data/sample-cards.json', import.meta.url);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const cards = JSON.parse(rawData);
  return cards.map((card: Card) => ({
    _id: new ObjectId(),
    ...card,
    id: card.id,
  }));
}

async function populateCardsCollection() {
  try {
    const cards = await fetchCards();
    const collection = DB.collection('cards');

    const operations = cards.map(card => ({
      updateOne: {
        filter: { id: card.id },
        update: { $setOnInsert: card },
        upsert: true
      }
    }));

    await collection.bulkWrite(operations);
    console.log('Cards collection populated successfully');
  } catch (error) {
    console.error('Error populating cards collection:', error);
    process.exit(1);
  }
}

populateCardsCollection();
