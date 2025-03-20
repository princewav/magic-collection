import { BaseService } from '@/db/services/BaseService';
import { DB, RepoCls } from '@/db/db';
import { DBWishlist } from '@/types/wishlist';

export class WishlistServiceImpl extends BaseService<DBWishlist> {
  public repo = new RepoCls<DBWishlist>(DB, 'wishlists');

  async findById(id: string): Promise<DBWishlist | null> {
    try {
      const wishlists = await this.repo.get([id]);
      return wishlists?.[0] || null;
    } catch (error) {
      console.error('Error finding wishlist by id:', error);
      return null;
    }
  }

  async deleteWishlist(id: string): Promise<boolean> {
    try {
      return await this.repo.delete(id);
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      return false;
    }
  }

  async duplicate(id: string): Promise<string | null> {
    try {
      const wishlists = await this.repo.get([id]);
      const wishlist = wishlists?.[0];
      if (!wishlist) return null;

      const { id: _, ...rest } = wishlist;
      const newWishlist: Omit<DBWishlist, 'id'> & { id?: string } = {
        ...rest,
        name: `${wishlist.name} (Copy)`,
      };

      return (await this.repo.create(newWishlist as DBWishlist)).id;
    } catch (error) {
      console.error('Error duplicating wishlist:', error);
      return null;
    }
  }
}

export const wishlistService = new WishlistServiceImpl();
