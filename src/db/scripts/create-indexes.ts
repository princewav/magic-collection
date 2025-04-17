import { DB } from '../db';

async function createIndexes() {
  try {
    console.log('Starting index creation...');

    // Create indexes for collection-cards
    const collectionCards = DB.collection('collection-cards');
    await collectionCards.createIndex({ collectionType: 1 });
    console.log('Created index on collection-cards.collectionType');

    await collectionCards.createIndex({ cardId: 1 });
    console.log('Created index on collection-cards.cardId');

    // Create index for cards
    const cards = DB.collection('cards');
    await cards.createIndex({ cardId: 1 });
    console.log('Created index on cards.cardId');

    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

// Run the script
createIndexes()
  .then(() => {
    console.log('Index creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create indexes:', error);
    process.exit(1);
  });
