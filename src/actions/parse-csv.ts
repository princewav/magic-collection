import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function parseCSV(formData: FormData) {
  const file = formData.get('file') as File;
  const text = await file.text();

  const records = parse(text, {
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
      'purchasePriceCurrency'
    ],
    skip_empty_lines: true,
    from_line: 2
  });

  // Process and validate records here
  console.log(records);

  return NextResponse.json({ success: true, data: records });
}
