'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function deleteDecks(ids: string[]) {
  try {
    await prisma.deck.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    console.log('Decks deleted successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to delete decks',
    };
  }

  revalidatePath('/');
}
