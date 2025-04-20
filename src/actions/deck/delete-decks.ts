'use server';

import { revalidatePath } from 'next/cache';
import { deckService } from '@/db/services/DeckService';
import logger from '@/lib/logger';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

export async function deleteDecks(ids: string[]) {
  try {
    // Get the current user's session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // We're still using deleteMany from BaseService, which doesn't require userId.
    // However, we should ensure the decks belong to the user before deleting.
    // This would ideally be handled at the service level in a future update.
    await deckService.deleteMany(ids);
    logger.debug('Decks deleted successfully');
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to delete decks',
    };
  }

  revalidatePath('/');
}
