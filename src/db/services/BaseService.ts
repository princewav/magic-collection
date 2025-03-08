import { BaseRepository } from '../repositories/BaseRepository';

export abstract class BaseService<T extends { id: string }> {
  protected repo: BaseRepository<T> | null = null;


  async deleteMany(ids: string[]) {
    if (!this.repo) {
      throw new Error('Repository not initialized');
    }
    try {
      const response = (await this.repo.get(ids)) || [];
      await Promise.all(response.map(async (doc) => this.repo!.remove(doc.id)));
      return true;
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to delete items ${ids}`);
    }
  }
}
