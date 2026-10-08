export class SearchTourCommand {
  public readonly name?: string;
  public readonly status?: 'draft' | 'active' | 'inactive';
  public readonly limit: number;
  public readonly offset: number;

  constructor(init: {
    readonly name?: string;
  readonly status?: 'draft' | 'active' | 'inactive';
    readonly limit?: number;
    readonly offset?: number;
  }) {
    Object.assign(this, init);
    this.limit = init.limit ?? 20;
    this.offset = init.offset ?? 0;
  }

  static fromInput(data: any): SearchTourCommand {
    return new SearchTourCommand(data);
  }
}
