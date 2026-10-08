import type { CategoryRepository } from '../repositories/category.repository';
import type { CategoryRow } from '../models/category.model';

export class CategoryFindService {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(id: string): Promise<CategoryRow> {
    return this.repository.findOrFail(id);
  }

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    return this.repository.findBySlug(slug);
  }

  async getActive(): Promise<CategoryRow[]> {
    return this.repository.getActive();
  }
}
