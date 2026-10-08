export class SearchCustomerCommand {
  private constructor(
    public readonly filters: any,
    public readonly limit: number,
    public readonly offset: number
  ) {}

  static fromInput(input: any): SearchCustomerCommand {
    return new SearchCustomerCommand(input, input.limit || 20, input.offset || 0);
  }
}
