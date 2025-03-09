import { BaseRepository } from './BaseRepository';
import { Collection, ObjectId, Db } from 'mongodb';

export class MongoRepository<T extends { id: string }> extends BaseRepository<T> {
  protected collection: Collection;
  protected collectionName: string;

  constructor(db: Db, collectionName: string) {
    super(db);
    this.collection = db.collection(collectionName);
    this.collectionName = collectionName;
  }

  async create(item: T): Promise<T> {
    const { id, ...doc } = item;
    const result = await this.collection.insertOne(doc);
    return {
      ...item,
      _id: result.insertedId,
    } as T;
  }

  async get(ids: string[]): Promise<T[] | null> {
    try {
      const objectIds = ids.map((id) => new ObjectId(id));
      const cursor = this.collection.find({ _id: { $in: objectIds } });
      const docs = await cursor.toArray();
      return docs.map(({_id, ...doc}) => ({id: _id.toString(), ...doc})) as unknown as T[];
    } catch (error) {
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    const cursor = this.collection.find({});
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as T[];
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: item },
        { returnDocument: 'after' },
      );
      if (!result || !result.value) {
        return null;
      }
      return result.value as unknown as T;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });
      return result.deletedCount === 1;
    } catch (error) {
      return false;
    }
  }

  async remove(id: string): Promise<void> {
    const objectId = new ObjectId(id);
    await this.collection.deleteOne({ _id: objectId });
  }

  async findBy(selector: Partial<T>): Promise<T[]> {
    try {
      const cursor = this.collection.find(selector);
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as T[];
    } catch (error) {
      return [];
    }
  }
  
}
