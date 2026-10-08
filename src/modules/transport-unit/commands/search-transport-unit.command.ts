export class SearchTransportUnitCommand {
  private constructor(
    public readonly filters: { q?: string; status?: string; type?: string },
    public readonly limit: number,
    public readonly offset: number,
  ) {}

  static fromInput(input: any): SearchTransportUnitCommand {
    return new SearchTransportUnitCommand(
      {
        q: input.q,
        status: input.status,
        type: input.type,
      },
      input.limit ?? 20,
      input.offset ?? 0,
    );
  }
}
