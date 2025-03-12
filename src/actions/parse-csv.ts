'use server';

import { parse } from 'csv-parse/sync';
import { collectionCardService, cardService } from '@/db/services/CardService';
import { CollectionCard } from '@/types/card';

async function getCardId(card: CollectionCard) {
  const cardData = await cardService.getByNameAndSet(
    card.cardName,
    card.setCode,
  );
  if (!cardData || cardData.length === 0) {
    throw new Error(`Card not found: ${card.cardName} (${card.setCode})`);
  }
  return cardData[0].id;
}

async function processRecordsAndGetIds(records, type) {
  const processedRecords = [];
  const allCardIds = [];

  // Process each record one by one
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const cardId = await getCardId(record);

    // Add to processed records
    processedRecords.push({
      ...record,
      collectionType: type,
      cardId: cardId,
    });

    // Add to our IDs array
    allCardIds.push(cardId);

    // Optional: Log to debug
    console.log(`Record ${i}: got cardId ${cardId}`);
  }
  return { processedRecords, allCardIds };
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
  const { processedRecords } = await processRecordsAndGetIds(records, type);
  await collectionCardService.repo.dropCollection();
  await collectionCardService.repo.createMany(processedRecords);
}
