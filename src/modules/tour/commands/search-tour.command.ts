import type { SearchTourInput } from '../validation/search-tour.schema';

export class SearchTourCommand {
  constructor(
    public readonly filters: {
      q?: string;
      name?: string;
      status?: 'draft' | 'active' | 'inactive';
    },
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}

  static fromInput(input: SearchTourInput): SearchTourCommand {
    return new SearchTourCommand(
      {
        q: input.q,
        name: input.name,
        status: input.status,
      },
      input.limit,
      input.offset,
    );
  }
}
