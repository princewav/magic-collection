'use server';

import { wishlistService } from '@/db/services/WishlistService';
import { loadDeckById } from '@/actions/deck/load-decks';
import { getMissingCards } from '@/actions/deck/missing-cards';
import { revalidatePath } from 'next/cache';

export async function createWishlistFromMissingCards(deckId: string) {
  try {
    const deck = await loadDeckById(deckId);
    if (!deck) {
      throw new Error('Deck not found');
    }

    const missingCards = await getMissingCards(deckId);

    // Create wishlist name
    const wishlistName = `Missing - ${deck.name}`;

    // Check for existing wishlists with the same name
    let finalWishlistName = wishlistName;
    let existingWishlists = await wishlistService.repo.findBy({
      name: finalWishlistName,
    });
    let count = 2;

    while (existingWishlists.length > 0) {
      finalWishlistName = `${wishlistName} (${count})`;
      existingWishlists = await wishlistService.repo.findBy({
        name: finalWishlistName,
      });
      count++;
    }

    // Calculate the total card count by summing quantities
    const totalCardCount = missingCards.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );

    // Create the wishlist
    const wishlist = await wishlistService.repo.create({
      id: '',
      name: finalWishlistName,
      imageUrl: deck.imageUrl,
      colors: deck.colors,
      cardCount: totalCardCount,
      cards: missingCards.map((card) => ({
        cardId: card.cardId,
        name: card.name,
        set: card.set,
        quantity: card.quantity,
        setNumber: parseInt(card.collector_number) || 0,
      })),
    });

    revalidatePath('/wishlists');
    return wishlist;
  } catch (error) {
    console.error('Error creating wishlist from missing cards:', error);
    throw new Error('Failed to create wishlist from missing cards');
  }
}
