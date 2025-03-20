'use server';

import { wishlistService } from '@/db/services/WishlistService';

export async function deleteWishlists(
  ids: string[],
): Promise<{ success: boolean; message?: string }> {
  try {
    await wishlistService.deleteMany(ids);
    return {
      success: true,
      message: `${ids.length} wishlist${ids.length > 1 ? 's' : ''} deleted`,
    };
  } catch (error) {
    console.error('Error deleting wishlists:', error);
    return {
      success: false,
      message: 'Failed to delete wishlists',
    };
  }
}
