import type { CategoryRepository } from '../repositories/category.repository';
import type { UpdateCategoryCommand } from '../commands/update-category.command';
import type { CategoryRow } from '../models/category.model';
import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class CategoryUpdateService {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(id: string, command: UpdateCategoryCommand): Promise<CategoryRow> {
    const existing = await this.repository.findBySlug(command.slug);
    if (existing && existing.id !== id) {
      throw new DomainError(`El slug "${command.slug}" ya está en uso por otra categoría.`);
    }

    return this.repository.update(id, command);
  }
}
