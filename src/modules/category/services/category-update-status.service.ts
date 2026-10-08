import type { CategoryRepository } from '../repositories/category.repository';
import type { UpdateStatusCategoryCommand } from '../commands/update-status-category.command';
import type { CategoryRow } from '../models/category.model';

export class CategoryUpdateStatusService {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(id: string, command: UpdateStatusCategoryCommand): Promise<CategoryRow> {
    return this.repository.updateStatus(id, command);
  }
}
