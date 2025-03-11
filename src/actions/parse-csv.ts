'use server';

import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { collectionCardService } from '@/db/services/CardService';


export async function parseCSVandInsert(data: string, type: string): Promise<void> {
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
  console.log(type);
  const processedRecords = records.map((record: Record<string, unknown>) => ({
    ...record,
    collectionType: type,
  }));
  console.log(processedRecords);
  await collectionCardService.repo.createMany(processedRecords);
}
