import { CollectionCard } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

export class CollectionCardService extends BaseService<CollectionCard> {
  public repo = new RepoCls<CollectionCard>(DB, 'collection-cards');

  async getByType(userId: string, type: 'paper' | 'arena') {
    // Query directly using the provided userId and type
    return this.repo.findBy({ userId, collectionType: type });
  }

  async getByUserId(userId: string) {
    // Directly query using the provided userId
    return this.repo.findBy({ userId });
  }

  async getByUserIdAndType(userId: string, type: 'paper' | 'arena') {
    // Directly query using the provided userId and type
    return this.repo.findBy({ userId, collectionType: type });
  }

  async getByCardId(
    userId: string,
    ids: string[],
  ): Promise<CollectionCard[] | null> {
    // Query using the provided userId and card IDs
    const cursor = this.repo.collection.find({
      cardId: { $in: ids },
      userId,
    });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }

  // Renamed for clarity, as the primary getByCardId now requires userId
  async getByCardIdForSpecificUser(
    userId: string,
    ids: string[],
  ): Promise<CollectionCard[] | null> {
    // This method remains essentially the same but is called by the new getByCardId
    const cursor = this.repo.collection.find({
      cardId: { $in: ids },
      userId,
    });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }

  async getByCardNames(
    userId: string,
    names: string[],
  ): Promise<CollectionCard[] | null> {
    // Query using the provided userId and card names
    const cursor = this.repo.collection.find({
      name: { $in: names },
      userId,
    });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }

  // Renamed for clarity
  async getByCardNamesForSpecificUser(
    userId: string,
    names: string[],
  ): Promise<CollectionCard[] | null> {
    // This method remains essentially the same but is called by the new getByCardNames
    const cursor = this.repo.collection.find({
      name: { $in: names },
      userId,
    });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }
}

export const collectionCardService = new CollectionCardService();
