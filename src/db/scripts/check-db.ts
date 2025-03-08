import { db } from '../repositories/BaseRepository';

async function countCards() {
  try {
    const result = await db.allDocs();
    console.log(`Total cards in the database: ${result.total_rows}`);
  } catch (error) {
    console.error('Error counting cards:', error);
  }
}

countCards();
