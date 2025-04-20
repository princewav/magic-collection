import { BaseService } from '@/db/services/BaseService';
import { DB, RepoCls } from '@/db/db';
import { DBWishlist } from '@/types/wishlist';

export class WishlistServiceImpl extends BaseService<DBWishlist> {
  public repo = new RepoCls<DBWishlist>(DB, 'wishlists');

  async findById(userId: string, id: string): Promise<DBWishlist | null> {
    try {
      // Fetch the specific wishlist
      const wishlists = await this.repo.get([id]);
      const wishlist = wishlists?.[0];

      // Verify the wishlist belongs to the provided userId
      if (!wishlist || wishlist.userId !== userId) {
        console.warn(
          `Attempt to access unauthorized wishlist ${id} by user ${userId}`,
        );
        return null; // Return null if not found or not authorized
      }

      return wishlist;
    } catch (error) {
      console.error(`Error finding wishlist ${id} for user ${userId}:`, error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<DBWishlist[]> {
    try {
      // Directly query using the provided userId
      return await this.repo.findBy({ userId });
    } catch (error) {
      console.error(`Error finding wishlists for user ${userId}:`, error);
      return [];
    }
  }

  async deleteWishlist(userId: string, id: string): Promise<boolean> {
    try {
      // First, verify the wishlist belongs to the provided userId
      const wishlists = await this.repo.get([id]);
      const wishlist = wishlists?.[0];

      if (!wishlist || wishlist.userId !== userId) {
        console.warn(
          `Unauthorized attempt to delete wishlist ${id} by user ${userId}`,
        );
        return false;
      }

      // Proceed with deletion if authorized
      return await this.repo.delete(id);
    } catch (error) {
      console.error(`Error deleting wishlist ${id} for user ${userId}:`, error);
      return false;
    }
  }

  async duplicate(userId: string, id: string): Promise<string | null> {
    try {
      // Fetch the wishlist to duplicate
      const wishlists = await this.repo.get([id]);
      const wishlist = wishlists?.[0];

      // Verify the wishlist belongs to the provided userId
      if (!wishlist || wishlist.userId !== userId) {
        console.warn(
          `Unauthorized attempt to duplicate wishlist ${id} by user ${userId}`,
        );
        return null;
      }

      // Prepare the new wishlist object
      const { id: _, ...rest } = wishlist;
      const newWishlist: Omit<DBWishlist, 'id'> & { id?: string } = {
        ...rest,
        name: `${wishlist.name} (Copy)`,
        userId: userId, // Ensure the new wishlist has the correct userId
      };

      // Create the duplicated wishlist
      const createdWishlist = await this.repo.create(newWishlist as DBWishlist);
      return createdWishlist.id;
    } catch (error) {
      console.error(
        `Error duplicating wishlist ${id} for user ${userId}:`,
        error,
      );
      return null;
    }
  }
}

export const wishlistService = new WishlistServiceImpl();
