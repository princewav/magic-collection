'use server';

import { wishlistSchema } from '@/app/wishlists/new/validation';
import { z } from 'zod';
import { wishlistService } from '@/db/services/WishlistService';
import { revalidatePath } from 'next/cache';

export const createWishlist = async (
  values: z.infer<typeof wishlistSchema>,
) => {
  try {
    // Check for existing wishlists with the same name
    let wishlistName = values.name;
    let existingWishlists = await wishlistService.repo.findBy({
      name: wishlistName,
    });
    let count = 2;

    while (existingWishlists.length > 0) {
      wishlistName = `${values.name} (${count})`;
      existingWishlists = await wishlistService.repo.findBy({
        name: wishlistName,
      });
      count++;
    }

    const wishlist = await wishlistService.repo.create({
      id: '',
      name: wishlistName,
      imageUrl: values.imageUrl ?? null,
      colors: values.colors,
      cardCount: 0,
      totalPrice: 0,
      cards: [],
    });

    revalidatePath('/wishlists');
    return wishlist;
  } catch (error) {
    console.error('Error creating wishlist:', error);
    throw new Error('Failed to create wishlist');
  }
};
