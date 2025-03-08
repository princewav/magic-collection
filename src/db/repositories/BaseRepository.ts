export abstract class BaseRepository<T> {
  protected abstract collectionName: string;
  protected db: unknown;

  constructor(db: unknown) {
    this.db = db;
  }

  abstract create(item: T): Promise<T>;
  abstract get(ids: string[]): Promise<T[] | null>;
  abstract getAll(): Promise<T[]>;
  abstract update(id: string, item: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract remove(id: string): Promise<void>;
}
