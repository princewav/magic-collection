'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

export async function deleteWishlist(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the current user's session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const success = await wishlistService.deleteWishlist(session.user.id, id);
    return {
      success,
      message: success ? 'Wishlist deleted' : 'Failed to delete wishlist',
    };
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    return {
      success: false,
      message: 'Failed to delete wishlist',
    };
  }
}
