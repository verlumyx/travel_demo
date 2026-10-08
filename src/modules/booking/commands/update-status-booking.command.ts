export class UpdateStatusBookingCommand {
  private constructor(
    public readonly id: string,
    public readonly status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled'
  ) {}

  static fromInput(id: string, input: any): UpdateStatusBookingCommand {
    return new UpdateStatusBookingCommand(id, input.status);
  }
}
