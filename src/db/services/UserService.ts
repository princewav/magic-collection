import { BaseService } from './BaseService';
import { DB, RepoCls } from '../db';
import {
  User,
  UserProfile,
  UserCreateInput,
  UserUpdateInput,
} from '@/types/user';
import bcrypt from 'bcryptjs';
import { DBDeck } from '@/types/deck';
import { CollectionCard } from '@/types/card';
import { DBWishlist } from '@/types/wishlist';

export class UserService extends BaseService<User> {
  public repo = new RepoCls<User>(DB, 'users');
  private deckCollection = DB.collection('decks');
  private collectionCardsCollection = DB.collection('collection-cards');
  private wishlistCollection = DB.collection('wishlists');

  // Basic user operations
  // --------------------

  async findById(id: string): Promise<UserProfile | null> {
    try {
      const users = await this.repo.get([id]);
      if (!users || users.length === 0) {
        return null;
      }

      const { password, ...userProfile } = users[0];
      return userProfile as UserProfile;
    } catch (error) {
      console.error('Error finding user by id:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.repo.findBy({ email });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    try {
      const users = await this.repo.findBy({ email });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user during authentication:', error);
      return null;
    }
  }

  async createUser(userData: UserCreateInput): Promise<UserProfile | null> {
    try {
      // Check if user with email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create the user
      const newUser = await this.repo.create({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
      } as unknown as User);

      // Return user without password
      const { password, ...userProfile } = newUser;
      return userProfile as UserProfile;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(
    id: string,
    userData: UserUpdateInput,
  ): Promise<UserProfile | null> {
    try {
      // Prepare update data
      const updateData: Partial<User> = { ...userData };

      // If password is included, hash it
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      // Add updatedAt timestamp
      updateData.updatedAt = new Date();

      // Update the user
      const updatedUser = await this.repo.update(id, updateData);
      if (!updatedUser) {
        return null;
      }

      // Return user without password
      const { password, ...userProfile } = updatedUser;
      return userProfile as UserProfile;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserProfile | null> {
    try {
      const user = await this.findByEmailForAuth(email);
      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Return user without sensitive data
      const { password: _, ...userProfile } = user;
      return userProfile as UserProfile;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      return await this.repo.delete(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // User decks operations
  // --------------------

  async getUserDecks(userId: string): Promise<DBDeck[]> {
    try {
      const cursor = this.deckCollection.find({ userId });
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as DBDeck[];
    } catch (error) {
      console.error('Error getting user decks:', error);
      return [];
    }
  }

  async getUserDecksByType(
    userId: string,
    type: 'paper' | 'arena',
  ): Promise<DBDeck[]> {
    try {
      const cursor = this.deckCollection.find({ userId, type });
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as DBDeck[];
    } catch (error) {
      console.error('Error getting user decks by type:', error);
      return [];
    }
  }

  // User collection operations
  // -------------------------

  async getUserCollection(userId: string): Promise<CollectionCard[]> {
    try {
      const cursor = this.collectionCardsCollection.find({ userId });
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as CollectionCard[];
    } catch (error) {
      console.error('Error getting user collection:', error);
      return [];
    }
  }

  async getUserCollectionByType(
    userId: string,
    type: 'paper' | 'arena',
  ): Promise<CollectionCard[]> {
    try {
      const cursor = this.collectionCardsCollection.find({
        userId,
        collectionType: type,
      });
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as CollectionCard[];
    } catch (error) {
      console.error('Error getting user collection by type:', error);
      return [];
    }
  }

  // User wishlist operations
  // -----------------------

  async getUserWishlists(userId: string): Promise<DBWishlist[]> {
    try {
      const cursor = this.wishlistCollection.find({ userId });
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as DBWishlist[];
    } catch (error) {
      console.error('Error getting user wishlists:', error);
      return [];
    }
  }

  // User stats and aggregations
  // --------------------------

  async getUserStats(userId: string): Promise<{
    deckCount: number;
    collectionCount: number;
    wishlistCount: number;
  }> {
    try {
      const [deckCount, collectionCount, wishlistCount] = await Promise.all([
        this.deckCollection.countDocuments({ userId }),
        this.collectionCardsCollection.countDocuments({ userId }),
        this.wishlistCollection.countDocuments({ userId }),
      ]);

      return {
        deckCount,
        collectionCount,
        wishlistCount,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        deckCount: 0,
        collectionCount: 0,
        wishlistCount: 0,
      };
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
