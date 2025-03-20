import { Wishlist, DBWishlist } from '@/types/wishlist';
import { wishlistService } from '@/db/services/WishlistService';
import { loadCardsById } from '@/actions/load-cards';

async function loadWishlistCards(wishlist: DBWishlist): Promise<Wishlist> {
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
    const wishlist = await wishlistService.findById(id);
    if (!wishlist) {
      return null;
    }

    return await loadWishlistCards(wishlist);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load wishlist');
  }
}

export async function loadWishlists(): Promise<Wishlist[]> {
  try {
    const wishlists = await wishlistService.repo.getAll();
    return await Promise.all(wishlists.map(loadWishlistCards));
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load wishlists');
  }
}
