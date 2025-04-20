'use server';

import { parse } from 'csv-parse/sync';
import { cardService } from '@/db/services/CardService';
import { collectionCardService } from '@/db/services/CollectionCardService';
import { CollectionCard } from '@/types/card';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

async function getCardId(card: CollectionCard) {
  const cardData = await cardService.getByNameAndSet(
    card.name,
    card.setCode,
    card.collectorNumber,
  );
  if (!cardData || cardData.length === 0) {
    throw new Error(
      `Card not found: ${card.name} (${card.setCode}) ${card.collectorNumber}`,
    );
  }
  return cardData[0].cardId;
}

export async function parseCSVandInsert(
  data: string,
  typeParam: string,
): Promise<void> {
  // Validate collection type
  const type =
    typeParam === 'paper' || typeParam === 'arena'
      ? (typeParam as 'paper' | 'arena')
      : 'paper';

  // Get the current user's session
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

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
    userId: session.user.id,
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

  // Instead of dropping the collection, find and delete only the user's cards of this type
  const userCards = await collectionCardService.repo.findBy({
    userId: session.user.id,
    collectionType: type,
  });

  if (userCards.length > 0) {
    await Promise.all(
      userCards.map((card) => collectionCardService.repo.delete(card.id)),
    );
  }

  await collectionCardService.repo.createMany(await processedRecords);
}
