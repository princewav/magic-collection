import PouchDB from 'pouchdb';
import { BaseRepository } from './BaseRepository';

export class CouchDbRepository<T extends object> extends BaseRepository<T> {
  constructor(collectionName: string) {
    super(collectionName);
    this.db = new PouchDB<T>(collectionName);
  }

  async create(item: T): Promise<T> {
    const response = await this.db.post(item);
    return { ...item, _id: response.id, _rev: response.rev } as T;
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.db.get(id);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<T[]> {
    const result = await this.db.allDocs({ include_docs: true });
    return result.rows.map((row) => row.doc) as T[];
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

  async remove(doc: T & PouchDB.Core.IdMeta): Promise<void> {
    this.db.remove(doc);
  }

  async find(
    selector: PouchDB.Find.Selector,
  ): Promise<PouchDB.Find.FindResponse<T>> {
    const response = await this.db.find({ selector });
    return response as PouchDB.Find.FindResponse<T>;
  }
}
