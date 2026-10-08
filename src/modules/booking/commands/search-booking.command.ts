export class SearchBookingCommand {
  private constructor(
    public readonly filters: any,
    public readonly limit: number,
    public readonly offset: number
  ) {}

  static fromInput(input: any): SearchBookingCommand {
    return new SearchBookingCommand(input, input.limit || 20, input.offset || 0);
  }
}
