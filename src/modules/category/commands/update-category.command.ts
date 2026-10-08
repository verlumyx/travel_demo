import type { UpdateCategoryInput } from '../validation/update-category.schema';

export class UpdateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string | null,
    public readonly icon?: string | null,
    public readonly imageUrl?: string | null,
  ) {}

  static fromInput(input: UpdateCategoryInput): UpdateCategoryCommand {
    return new UpdateCategoryCommand(
      input.name,
      input.slug,
      input.description,
      input.icon,
      input.imageUrl,
    );
  }
}
