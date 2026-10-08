export class SearchPassengerCommand {
  private constructor(
    public readonly filters: any,
    public readonly limit: number,
    public readonly offset: number
  ) {}

  static fromInput(input: any): SearchPassengerCommand {
    return new SearchPassengerCommand(input, input.limit || 20, input.offset || 0);
  }
}
