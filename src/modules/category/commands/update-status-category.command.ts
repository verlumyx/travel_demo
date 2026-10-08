import type { UpdateStatusCategoryInput } from '../validation/update-status-category.schema';

export class UpdateStatusCategoryCommand {
  constructor(public readonly status: 'active' | 'inactive') {}

  static fromInput(input: UpdateStatusCategoryInput): UpdateStatusCategoryCommand {
    return new UpdateStatusCategoryCommand(input.status);
  }
}
