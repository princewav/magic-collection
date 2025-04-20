'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

export async function duplicateWishlist(
  id: string,
): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    // Get the current user's session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const newId = await wishlistService.duplicate(session.user.id, id);
    return {
      success: !!newId,
      id: newId || undefined,
      message: newId ? 'Wishlist duplicated' : 'Failed to duplicate wishlist',
    };
  } catch (error) {
    console.error('Error duplicating wishlist:', error);
    return {
      success: false,
      message: 'Failed to duplicate wishlist',
    };
  }
}
