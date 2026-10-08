export class UpdateBookingCommand {
  private constructor(
    public readonly id: string,
    public readonly departureId: string,
    public readonly customerId: string,
    public readonly slotsReserved: number,
    public readonly totalAmount: string,
    public readonly paidAmount?: string,
    public readonly notes?: string,
    public readonly source?: 'admin' | 'portal'
  ) {}

  static fromInput(id: string, input: any): UpdateBookingCommand {
    return new UpdateBookingCommand(
      id,
      input.departureId,
      input.customerId,
      input.slotsReserved,
      input.totalAmount,
      input.paidAmount,
      input.notes,
      input.source
    );
  }
}
