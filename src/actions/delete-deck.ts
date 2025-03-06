'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function deleteDeck(id: string) {
  try {
    await prisma.deck.deleteMany({
      where: {
        id,
      },
    });
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to delete deck',
    };
  }

  revalidatePath('/');
}
