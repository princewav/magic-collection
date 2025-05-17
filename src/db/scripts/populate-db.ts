import fs from 'fs';
import { extractMtgCardData, Card } from '@/types/card';
import { cardService } from '../services/CardService';
import logger from '@/lib/logger';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchCards(): Promise<Card[]> {
  const dataPath = 'data/default-cards-20250517091434.json';
  const filePath = path.join(__dirname, '../../..', dataPath);
  console.log(filePath);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const cards = JSON.parse(rawData);
  return cards
    .filter((card: Card) => card.layout !== 'art_series')
    .map((card: Card) => extractMtgCardData(card));
}

async function populateCardsCollection() {
  try {
    const cards = await fetchCards();
    console.log(cards.length);

    // Drop the existing collection first
    logger.debug('Dropping existing cards collection...');
    await cardService.repo.dropCollection();
    logger.debug('Existing cards collection dropped.');

    const result = await cardService.repo.createMany(cards);
    console.log(result.length);
    logger.debug('Cards collection populated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error populating cards collection:', error);
    process.exit(1);
  }
}

populateCardsCollection();
