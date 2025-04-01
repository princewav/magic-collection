import { BaseRepository } from './BaseRepository';
import { Collection, ObjectId, Db, Filter, Document } from 'mongodb';

export class MongoRepository<T extends { id: string }> extends BaseRepository<T> {
  public collection: Collection<Document>;
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
      id: result.insertedId.toString(),
    } as T;
  }

  async createMany<T extends { id?: string }>(
    items: Omit<T, 'id'>[],
  ): Promise<T[]> {
    const docs = items.map((item) => {
      const { id, ...itemWithoutId } = item as any;
      return itemWithoutId;
    });
    const result = await this.collection.insertMany(docs);
    return Object.values(result.insertedIds).map((insertedId, index) => {
      return {
        ...items[index],
        id: insertedId.toString(),
      } as unknown as T;
    });
  }

  async get(ids: string[]): Promise<T[] | null> {
    try {
      const objectIds = ids.map((id) => new ObjectId(id));
      const cursor = this.collection.find({ _id: { $in: objectIds } });
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as T[];
    } catch (error) {
      return null;
    }
  }

  async getAll(limit: number = 0): Promise<T[]> {
    const cursor = this.collection.find({}).limit(limit > 0 ? limit : 0);
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
      if (!result) {
        return null;
      }
      const { _id, ...rest } = result;
      return { ...rest, id: _id.toString() } as unknown as T;
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

  async findBy(selector: Filter<T>): Promise<T[]> {
    try {
      const cursor = this.collection.find(selector as Filter<Document>);
      const docs = await cursor.toArray();
      return docs.map(({ _id, ...doc }) => ({
        id: _id.toString(),
        ...doc,
      })) as unknown as T[];
    } catch (error) {
      return [];
    }
  }

  async dropCollection() {
    return this.collection.drop();
  }
}
