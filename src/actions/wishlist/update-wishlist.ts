'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { wishlistSchema } from '@/app/wishlists/new/validation';

type UpdateWishlistInput = z.infer<typeof wishlistSchema> & {
  id: string;
};

export async function updateWishlist(data: UpdateWishlistInput) {
  try {
    const { id, name, colors, imageUrl } = data;

    // First check if the wishlist exists
    const existingWishlists = await wishlistService.repo.get([id]);
    if (!existingWishlists || existingWishlists.length === 0) {
      return {
        success: false,
        message: 'Wishlist not found',
      };
    }

    const updatedWishlist = await wishlistService.repo.update(id, {
      name,
      colors,
      imageUrl: imageUrl || null,
    });

    revalidatePath('/wishlists');
    revalidatePath(`/wishlists/${id}`);

    return {
      success: true,
      message: 'Wishlist updated successfully',
      id: updatedWishlist?.id || id,
    };
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return {
      success: false,
      message: 'Failed to update wishlist',
    };
  }
}
