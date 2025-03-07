import { POUCHDB_PATH } from '@/lib/constants';
import PouchDB from 'pouchdb';

// Initialize PouchDB with the magic database
export const db = new PouchDB(POUCHDB_PATH);

// Base repository class for other repositories to extend
export abstract class BaseRepository<T extends object> {
  protected db: PouchDB.Database;

  constructor() {
    this.db = db;
  }

  async create(doc: T): Promise<PouchDB.Core.Response> {
    return this.db.post(doc as PouchDB.Core.PostDocument<T>) as unknown as PouchDB.Core.Response;
  }

  async get(id: string): Promise<PouchDB.Core.Document<T>> {
    return this.db.get(id) as unknown as PouchDB.Core.Document<T>;
  }

  async update(doc: T & { _id: string; _rev: string }): Promise<PouchDB.Core.Response> {
    return this.db.put(doc) as unknown as PouchDB.Core.Response;
  }

  async delete(id: string, rev: string): Promise<PouchDB.Core.Response> {
    return this.db.remove(id, rev) as unknown as PouchDB.Core.Response;
  }

  async findAll(): Promise<T[]> {
    const result = await this.db.allDocs({ include_docs: true });
    return result.rows.map(row => row.doc) as T[];
  }
}
