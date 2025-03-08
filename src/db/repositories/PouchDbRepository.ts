import { BaseRepository } from './BaseRepository';

export class PouchDbRepository<
  T extends { id: string },
> extends BaseRepository<T> {
  protected connection;
  protected collectionName: string;

  constructor(
    connection: PouchDB.Database<T & PouchDB.Core.AllDocsMeta>,
    collectionName: string,
  ) {
    super(connection);
    this.connection = connection;
    this.collectionName = collectionName;
  }

  async create(item: T): Promise<T> {
    const { id, ...doc } = item;
    const response = await this.connection.post({
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
      const response = await this.connection.find({
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
    const result = await this.connection.find({
      selector: { type: this.collectionName },
    });
    return result.docs as T[];
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    try {
      const existing = await this.connection.get<T & PouchDB.Core.IdMeta>(id);
      const updated = { ...existing, ...item } as T & PouchDB.Core.IdMeta;
      await this.connection.put(updated);
      return updated as T;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const doc = await this.connection.get(id);
      await this.connection.remove(doc);
      return true;
    } catch (error) {
      return false;
    }
  }

  async remove(id: string): Promise<void> {
    const doc = await this.connection.get(id);
    await this.connection.remove(doc);
  }
}
