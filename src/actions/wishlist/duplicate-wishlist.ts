'use server';

import { wishlistService } from '@/db/services/WishlistService';

export async function duplicateWishlist(
  id: string,
): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    const newId = await wishlistService.duplicate(id);
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
