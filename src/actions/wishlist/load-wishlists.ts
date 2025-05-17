import { Wishlist, DBWishlist } from '@/types/wishlist';
import { wishlistService } from '@/db/services/WishlistService';
import { loadCardsById } from '@/actions/card/load-cards';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string> {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user.id;
}

export async function loadWishlistCards(
  wishlist: DBWishlist,
): Promise<Wishlist> {
  const cardIds = wishlist.cards.map((card) => card.cardId);
  const cards = await loadCardsById(cardIds);

  const cardsWithQuantity = cards.map((card) => ({
    ...card,
    quantity:
      wishlist.cards.find((c) => c.cardId === card.cardId)?.quantity || 0,
  }));

  return {
    ...wishlist,
    cards: cardsWithQuantity,
  };
}

export async function loadWishlistById(id: string): Promise<Wishlist | null> {
  try {
    const userId = await getCurrentUserId();
    const wishlist = await wishlistService.findById(userId, id);
    if (!wishlist) {
      return null;
    }

    return await loadWishlistCards(wishlist);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load wishlist');
  }
}

export async function loadWishlistWithoutCards(
  id: string,
): Promise<DBWishlist | null> {
  try {
    const userId = await getCurrentUserId();
    return await wishlistService.findById(userId, id);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load wishlist');
  }
}

export async function loadWishlists(): Promise<Wishlist[]> {
  try {
    const userId = await getCurrentUserId();
    const wishlists = await wishlistService.findByUserId(userId);
    return await Promise.all(wishlists.map(loadWishlistCards));
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load wishlists');
  }
}
