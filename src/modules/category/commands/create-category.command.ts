import type { CreateCategoryInput } from '../validation/create-category.schema';

export class CreateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string | null,
    public readonly icon?: string | null,
    public readonly imageUrl?: string | null,
  ) {}

  static fromInput(input: CreateCategoryInput): CreateCategoryCommand {
    return new CreateCategoryCommand(
      input.id,
      input.name,
      input.slug,
      input.description,
      input.icon,
      input.imageUrl,
    );
  }
}
