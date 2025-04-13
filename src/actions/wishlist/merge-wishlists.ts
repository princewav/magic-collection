'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { loadWishlistById } from '@/actions/wishlist/load-wishlists';
import { revalidatePath } from 'next/cache';

export async function mergeWishlists(
  ids: string[],
): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    if (ids.length < 2) {
      return {
        success: false,
        message: 'At least two wishlists are required for merging',
      };
    }

    // Load all the wishlists to be merged
    const wishlists = await Promise.all(ids.map((id) => loadWishlistById(id)));
    const validWishlists = wishlists.filter(Boolean);

    if (validWishlists.length !== ids.length) {
      return {
        success: false,
        message: 'Some wishlists could not be found',
      };
    }

    // Create a name for the merged wishlist
    const mergedName = `Merged Wishlist (${new Date().toLocaleDateString()})`;

    // Combine all unique cards
    const cardMap = new Map();
    const allColors = new Set<string>();

    validWishlists.forEach((wishlist) => {
      if (!wishlist) return;

      // Add colors
      wishlist.colors.forEach((color) => allColors.add(color));

      // Add cards with quantities
      wishlist.cards.forEach((card) => {
        const existingCard = cardMap.get(card.cardId);
        if (existingCard) {
          cardMap.set(card.cardId, {
            ...existingCard,
            quantity: existingCard.quantity + card.quantity,
          });
        } else {
          cardMap.set(card.cardId, { ...card });
        }
      });
    });

    // Calculate the total card count by summing quantities
    const mergedCardsArray = Array.from(cardMap.values());
    const totalCardCount = mergedCardsArray.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );

    // Create the new merged wishlist
    const mergedWishlist = await wishlistService.repo.create({
      id: '',
      name: mergedName,
      imageUrl: validWishlists[0]?.imageUrl || null,
      colors: Array.from(allColors) as any,
      cardCount: totalCardCount,
      cards: mergedCardsArray,
    });

    // Revalidate the wishlists path
    revalidatePath('/wishlists');

    return {
      success: true,
      id: mergedWishlist.id,
      message: 'Wishlists merged successfully',
    };
  } catch (error) {
    console.error('Error merging wishlists:', error);
    return {
      success: false,
      message: 'Failed to merge wishlists',
    };
  }
}
