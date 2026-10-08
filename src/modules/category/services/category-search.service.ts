import type { CategoryRepository } from '../repositories/category.repository';
import type { SearchCategoryCommand } from '../commands/search-category.command';
import type { CategoryRow } from '../models/category.model';

export class CategorySearchService {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(command: SearchCategoryCommand): Promise<{ data: CategoryRow[]; total: number }> {
    return this.repository.search(command);
  }
}
