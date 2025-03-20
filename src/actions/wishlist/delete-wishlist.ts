'use server';

import { wishlistService } from '@/db/services/WishlistService';

export async function deleteWishlist(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const success = await wishlistService.deleteWishlist(id);
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
