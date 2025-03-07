'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { InputJsonValue } from '@prisma/client/runtime/library';

export async function duplicateDeck(deckId: string): Promise<string> {
  try {
    const deck = await prisma.deck.findUnique({
      where: {
        id: deckId,
      },
    });

    if (!deck) {
      throw new Error('Deck not found');
    }

    const { id, ...newDeckData } = {
      ...deck,
      name: `Copy of ${deck.name}`,
      colors: deck.colors as InputJsonValue,
    };

    const newDeck = await prisma.deck.create({ data: newDeckData });

    revalidatePath('/decks');
    return newDeck.id;
  } catch (error: any) {
    console.error('Error duplicating deck:', error);
    throw new Error(`Failed to duplicate deck: ${error.message}`);
  }
}
