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
    // const cards = await fetchCards();
    const cards = [{
      id: 'deck-123',
      name: 'Sample Deck',
      imageUrl: null,
      colors: ['W', 'U'],
      format: 'Standard',
      description: 'This is a sample deck for testing purposes.',
      type: 'deck',
    }];
    console.log('Cards fetched:', cards.length);
    const collection = DB.collection('decks');
    const collections = await DB.listCollections().toArray();
    console.log(collections);

    const operations = cards.map(card => ({
      updateOne: {
        filter: { id: card.id },
        update: { $setOnInsert: card },
        upsert: true
      }
    }));

    await collection.bulkWrite(operations);
    console.log('Cards collection populated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error populating cards collection:', error);
    process.exit(1);
  }
}

populateCardsCollection();
