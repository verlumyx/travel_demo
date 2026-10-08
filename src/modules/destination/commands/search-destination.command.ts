import type { SearchDestinationInput } from '../validation/search-destination.schema';

export class SearchDestinationCommand {
  constructor(
    public readonly filters: {
      q?: string;
      name?: string;
      categoryId?: string;
      country?: string;
      status?: 'active' | 'inactive';
    },
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}

  static fromInput(input: SearchDestinationInput): SearchDestinationCommand {
    return new SearchDestinationCommand(
      {
        q: input.q,
        name: input.name,
        categoryId: input.categoryId,
        country: input.country,
        status: input.status,
      },
      input.limit,
      input.offset,
    );
  }
}
