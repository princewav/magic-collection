'use server';

import { parse } from 'csv-parse/sync';
import { collectionCardService, cardService } from '@/db/services/CardService';
import { CollectionCard } from '@/types/card';

async function getCardId(card: CollectionCard) {
  const cardData = await cardService.getByNameAndSet(card.cardName, card.setCode);
  if (!cardData || cardData.length === 0) {
    throw new Error(`Card not found: ${card.cardName} (${card.setCode})`);
  }
  return cardData[0].id;
}

export async function parseCSVandInsert(
  data: string,
  type: string,
): Promise<void> {
  const records = parse(data, {
    columns: [
      'binderName',
      'binderType',
      'name',
      'setCode',
      'setName',
      'collectorNumber',
      'foil',
      'rarity',
      'quantity',
      'manaBoxId',
      'scryfallId',
      'purchasePrice',
      'misprint',
      'altered',
      'condition',
      'language',
      'purchasePriceCurrency',
    ],
    skip_empty_lines: true,
    from_line: 2,
  });

  // Process and validate records here
  const processedRecords = Promise.all(records.map((record: CollectionCard) => ({
    ...record,
    collectionType: type,
    cardId: getCardId(record)
  })))
  await collectionCardService.repo.dropCollection();
  await collectionCardService.repo.createMany(await processedRecords);
}
