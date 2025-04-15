'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger'; // Assuming a logger exists

/**
 * Removes a specific card from a wishlist.
 * @param wishlistId The ID of the wishlist.
 * @param cardId The Scryfall ID of the card to remove.
 * @returns Object indicating success or failure with a message.
 */
export async function removeCardFromWishlist(
  wishlistId: string,
  cardId: string,
): Promise<{ success: boolean; message?: string }> {
  logger.info(
    `Attempting to remove card ${cardId} from wishlist ${wishlistId}`,
  );

  if (!ObjectId.isValid(wishlistId)) {
    logger.error('Invalid wishlist ID format');
    return { success: false, message: 'Invalid wishlist ID format.' };
  }

  try {
    const objectId = new ObjectId(wishlistId);
    const wishlists = await wishlistService.repo.get([objectId.toHexString()]);
    const wishlist = wishlists?.[0];

    if (!wishlist) {
      logger.error(`Wishlist not found: ${wishlistId}`);
      return { success: false, message: 'Wishlist not found.' };
    }

    const initialCardCount = wishlist.cards?.length || 0;
    const updatedCards =
      wishlist.cards?.filter((c) => c.cardId !== cardId) || [];

    if (updatedCards.length === initialCardCount) {
      logger.warn(`Card ${cardId} not found in wishlist ${wishlistId}`);
      // Arguably, this isn't an error, the card is already gone.
      // Return success, but maybe log a warning.
      return { success: true, message: 'Card not found in wishlist.' };
    }

    const updatedWishlist = await wishlistService.repo.update(wishlistId, {
      cards: updatedCards,
    });

    if (!updatedWishlist) {
      logger.error(
        `Failed to update wishlist ${wishlistId} after removing card ${cardId}`,
      );
      return {
        success: false,
        message: 'Failed to update wishlist after removing card.',
      };
    }

    logger.info(
      `Successfully removed card ${cardId} from wishlist ${wishlistId}`,
    );
    // Revalidate the specific wishlist page path
    revalidatePath(`/wishlists/${wishlistId}`);

    return { success: true };
  } catch (error) {
    logger.error(
      `Error removing card ${cardId} from wishlist ${wishlistId}: ${error}`,
    );
    return {
      success: false,
      message: 'An unexpected error occurred while removing the card.',
    };
  }
}
