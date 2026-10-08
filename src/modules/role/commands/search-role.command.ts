export class SearchRoleCommand {
  public readonly name?: string;
  public readonly status?: 'active' | 'inactive';
  public readonly limit: number;
  public readonly offset: number;

  constructor(init: {
    readonly name?: string;
  readonly status?: 'active' | 'inactive';
    readonly limit?: number;
    readonly offset?: number;
  }) {
    Object.assign(this, init);
    this.limit = init.limit ?? 20;
    this.offset = init.offset ?? 0;
  }

  static fromInput(data: any): SearchRoleCommand {
    return new SearchRoleCommand(data);
  }
}
