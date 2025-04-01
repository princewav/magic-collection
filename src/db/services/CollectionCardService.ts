import { CollectionCard } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';

export class CollectionCardService extends BaseService<CollectionCard> {
  public repo = new RepoCls<CollectionCard>(DB, 'collection-cards');

  async getByType(type: 'paper' | 'arena') {
    return this.repo.findBy({ collectionType: type });
  }

  async getByCardId(ids: string[]): Promise<CollectionCard[] | null> {
    const cursor = this.repo.collection.find({ cardId: { $in: ids } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }
  async getByCardNames(names: string[]): Promise<CollectionCard[] | null> {
    const cursor = this.repo.collection.find({ name: { $in: names } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }
}

export const collectionCardService = new CollectionCardService();
