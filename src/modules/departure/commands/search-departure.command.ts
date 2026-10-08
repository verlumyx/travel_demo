export class SearchDepartureCommand {
  private constructor(
    public readonly filters: { q?: string; status?: string; tourId?: string },
    public readonly limit: number,
    public readonly offset: number,
  ) {}

  static fromInput(input: any): SearchDepartureCommand {
    return new SearchDepartureCommand(
      {
        q: input.q,
        status: input.status,
        tourId: input.tourId,
      },
      input.limit ?? 20,
      input.offset ?? 0,
    );
  }
}
