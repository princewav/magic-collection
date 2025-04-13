'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { revalidatePath } from 'next/cache';

export async function updateCardQuantity(
  wishlistId: string,
  cardId: string,
  newQuantity: number,
) {
  try {
    if (newQuantity < 0) {
      return {
        success: false,
        message: 'Quantity cannot be negative',
      };
    }

    const wishlists = await wishlistService.repo.get([wishlistId]);
    if (!wishlists || wishlists.length === 0) {
      return {
        success: false,
        message: 'Wishlist not found',
      };
    }

    const wishlist = wishlists[0];
    const updatedCards = [...wishlist.cards];

    const cardIndex = updatedCards.findIndex((card) => card.cardId === cardId);
    if (cardIndex === -1) {
      return {
        success: false,
        message: 'Card not found in wishlist',
      };
    }

    if (newQuantity === 0) {
      // Remove the card from the wishlist
      updatedCards.splice(cardIndex, 1);
    } else {
      // Update the quantity
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        quantity: newQuantity,
      };
    }

    // Update the wishlist with the new cards array
    const updatedWishlist = await wishlistService.repo.update(wishlistId, {
      cards: updatedCards,
      cardCount: updatedCards.length,
    });

    revalidatePath('/wishlists');
    revalidatePath(`/wishlists/${wishlistId}`);

    return {
      success: true,
      message: 'Card quantity updated',
      updatedWishlist,
    };
  } catch (error) {
    console.error('Error updating card quantity:', error);
    return {
      success: false,
      message: 'Failed to update card quantity',
    };
  }
}
