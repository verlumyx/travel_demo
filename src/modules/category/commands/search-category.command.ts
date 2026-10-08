import type { SearchCategoryInput } from '../validation/search-category.schema';

export class SearchCategoryCommand {
  constructor(
    public readonly filters: {
      q?: string;
      code?: string;
      status?: 'active' | 'inactive';
    },
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}

  static fromInput(input: SearchCategoryInput): SearchCategoryCommand {
    return new SearchCategoryCommand(
      {
        q: input.q,
        code: input.code,
        status: input.status,
      },
      input.limit,
      input.offset,
    );
  }
}
