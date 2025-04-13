import { CardWithQuantity } from '@/types/card';
import { ManaColor } from '@/types/deck';

export type WishlistCard = {
  quantity: number;
  name: string;
  cardId: string;
  set: string;
  setNumber: number;
  price: number;
};

export type WishlistInfo = {
  id: string;
  name: string;
  imageUrl: string | null;
  colors: ManaColor[];
  cardCount: number;
  totalPrice: number;
};

export type DBWishlist = WishlistInfo & {
  cards: WishlistCard[];
};

export type Wishlist = WishlistInfo & {
  cards: CardWithQuantity[];
};
