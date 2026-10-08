export class SearchDepartureUnitCommand {
  private constructor(
    public readonly filters: { departureId?: string; transportUnitId?: string },
    public readonly limit: number,
    public readonly offset: number,
  ) {}

  static fromInput(input: any): SearchDepartureUnitCommand {
    return new SearchDepartureUnitCommand(
      {
        departureId: input.departureId,
        transportUnitId: input.transportUnitId,
      },
      input.limit ?? 20,
      input.offset ?? 0,
    );
  }
}
