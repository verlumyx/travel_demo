import type { CategoryRow } from '../models/category.model';
import type { CreateCategoryCommand } from '../commands/create-category.command';
import type { UpdateCategoryCommand } from '../commands/update-category.command';
import type { UpdateStatusCategoryCommand } from '../commands/update-status-category.command';
import type { SearchCategoryCommand } from '../commands/search-category.command';

export interface CategoryRepository {
  create(command: CreateCategoryCommand): Promise<CategoryRow>;
  findById(id: string): Promise<CategoryRow | null>;
  findOrFail(id: string): Promise<CategoryRow>;
  findBySlug(slug: string): Promise<CategoryRow | null>;
  update(id: string, command: UpdateCategoryCommand): Promise<CategoryRow>;
  updateStatus(id: string, command: UpdateStatusCategoryCommand): Promise<CategoryRow>;
  search(command: SearchCategoryCommand): Promise<{ data: CategoryRow[]; total: number }>;
  getActive(): Promise<CategoryRow[]>;
}
