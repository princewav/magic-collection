import { POUCHDB_PATH } from '@/lib/constants';
import PouchDB from 'pouchdb';

export const db = new PouchDB(POUCHDB_PATH);

export abstract class BaseRepository<T extends object> {
  protected collectionName: string;
  protected db: PouchDB.Database;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.db = db;
  }

  abstract create(item: T): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract update(id: string, item: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract find(selector: PouchDB.Find.Selector): Promise<PouchDB.Find.FindResponse<T>>;
  abstract remove(doc: T & PouchDB.Core.IdMeta): Promise<void>;

  async createDoc(doc: T): Promise<PouchDB.Core.Response> {
    return this.db.post(doc as PouchDB.Core.PostDocument<T>) as unknown as PouchDB.Core.Response;
  }

  async getDoc(id: string): Promise<PouchDB.Core.Document<T>> {
    return this.db.get(id) as unknown as PouchDB.Core.Document<T>;
  }

  async updateDoc(doc: T & { _id: string; _rev: string }): Promise<PouchDB.Core.Response> {
    return this.db.put(doc) as unknown as PouchDB.Core.Response;
  }

  async deleteDoc(id: string, rev: string): Promise<PouchDB.Core.Response> {
    return this.db.remove(id, rev) as unknown as PouchDB.Core.Response;
  }

  async findAllDocs(): Promise<T[]> {
    const result = await this.db.allDocs({ include_docs: true });
    return result.rows.map(row => row.doc) as T[];
  }
}
