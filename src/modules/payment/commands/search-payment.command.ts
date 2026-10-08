export class SearchPaymentCommand {
  private constructor(
    public readonly filters: any,
    public readonly limit: number,
    public readonly offset: number
  ) {}

  static fromInput(input: any): SearchPaymentCommand {
    return new SearchPaymentCommand(input, input.limit || 20, input.offset || 0);
  }
}
