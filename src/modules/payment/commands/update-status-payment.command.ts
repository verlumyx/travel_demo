export class UpdateStatusPaymentCommand {
  private constructor(
    public readonly id: string,
    public readonly status: 'pending' | 'verified' | 'rejected'
  ) {}

  static fromInput(id: string, input: any): UpdateStatusPaymentCommand {
    return new UpdateStatusPaymentCommand(id, input.status);
  }
}
