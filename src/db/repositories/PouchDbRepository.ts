import { BaseRepository } from './BaseRepository';

export class PouchDbRepository<
  T extends { id: string },
> extends BaseRepository<T> {
  protected db: PouchDB.Database<T & PouchDB.Core.AllDocsMeta>;
  protected collectionName: string;

  constructor(
    db: PouchDB.Database<T & PouchDB.Core.AllDocsMeta>,
    collectionName: string,
  ) {
    super(db);
    this.db = db;
    this.collectionName = collectionName;
  }

  async create(item: T): Promise<T> {
    const { id, ...doc } = item;
    const response = await this.db.post({
      ...doc,
      type: this.collectionName,
    } as any);

    return {
      ...item,
      _id: response.id,
      _rev: response.rev,
    } as T;
  }

  async get(ids: string[]): Promise<T[] | null> {
    try {
      const response = await this.db.find({
        selector: {
          _id: { $in: ids },
          type: this.collectionName,
        },
      });
      return response.docs;
    } catch (error) {
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    const result = await this.db.find({
      selector: { type: this.collectionName },
    });
    return result.docs as T[];
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    try {
      const existing = await this.db.get<T & PouchDB.Core.IdMeta>(id);
      const updated = { ...existing, ...item } as T & PouchDB.Core.IdMeta;
      await this.db.put(updated);
      return updated as T;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const doc = await this.db.get(id);
      await this.db.remove(doc);
      return true;
    } catch (error) {
      return false;
    }
  }

  async remove(id: string): Promise<void> {
    const doc = await this.db.get(id);
    await this.db.remove(doc);
  }
}
