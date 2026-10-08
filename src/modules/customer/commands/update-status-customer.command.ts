export class UpdateStatusCustomerCommand {
  private constructor(
    public readonly id: string,
    public readonly status: 'active' | 'inactive'
  ) {}

  static fromInput(id: string, input: any): UpdateStatusCustomerCommand {
    return new UpdateStatusCustomerCommand(id, input.status);
  }
}
