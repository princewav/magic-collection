import fs from 'fs';
import { extractMtgCardData, Card } from '@/types/card';
import { cardService } from '../services/CardService';
import logger from '@/lib/logger';

async function fetchCards(): Promise<Card[]> {
  const filePath = new URL(
    '../../../data/default-cards-20250308225834.json',
    import.meta.url,
  );
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const cards = JSON.parse(rawData);
  return cards.map((card: Card) => extractMtgCardData(card));
}

async function populateCardsCollection() {
  try {
    const cards = await fetchCards();
    console.log(cards.length);
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
