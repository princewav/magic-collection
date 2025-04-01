'use server';

import { parse } from 'csv-parse/sync';
import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import { CollectionCard } from '@/types/card';

async function getCardId(card: CollectionCard) {
  const cardData = await cardService.getByNameAndSet(
    card.name,
    card.setCode,
    card.collectorNumber,
  );
  if (!cardData || cardData.length === 0) {
    throw new Error(`Card not found: ${card.name} (${card.setCode}) ${card.collectorNumber}`);
  }
  return cardData[0].cardId;
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

  const collectionCards = records.map((record: CollectionCard) => ({
    ...record,
    collectionType: type,
    quantity: Number(record.quantity),
    misprint: Boolean(record.misprint),
    altered: Boolean(record.altered),
    purchasePrice: Number(record.purchasePrice),
  }));

  // Process and validate records here
  const processedRecords = Promise.all(
    collectionCards.map(async (record: CollectionCard) => ({
      ...record,
      cardId: await getCardId(record),
    })),
  );
  await collectionCardService.repo.dropCollection();
  await collectionCardService.repo.createMany(await processedRecords);
}
