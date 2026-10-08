import type { CategoryRepository } from '../repositories/category.repository';
import type { CreateCategoryCommand } from '../commands/create-category.command';
import type { CategoryRow } from '../models/category.model';
import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class CategoryCreateService {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryRow> {
    const existing = await this.repository.findBySlug(command.slug);
    if (existing) {
      throw new DomainError(`Ya existe una categoría con el slug "${command.slug}".`);
    }

    return this.repository.create(command);
  }
}
