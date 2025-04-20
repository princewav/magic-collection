'use server';

import { revalidatePath } from 'next/cache';
import { deckService } from '@/db/services/DeckService';
import logger from '@/lib/logger';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

export async function duplicateDecks(ids: string[]) {
  try {
    // Get the current user's session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    await deckService.duplicateMany(session.user.id, ids);
    logger.debug('Decks duplicated successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to duplicate decks',
    };
  }
  revalidatePath('/');
}
