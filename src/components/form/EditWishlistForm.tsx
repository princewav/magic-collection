'use client';

import { Wishlist } from '@/types/wishlist';
import { EditWishlistClient } from '@/app/wishlists/[id]/edit/EditWishlistClient';

interface EditWishlistFormProps {
  wishlist: Wishlist;
}

export function EditWishlistForm({ wishlist }: EditWishlistFormProps) {
  return <EditWishlistClient wishlist={wishlist} />;
}
