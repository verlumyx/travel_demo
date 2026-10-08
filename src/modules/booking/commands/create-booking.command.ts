export class CreateBookingCommand {
  private constructor(
    public readonly id: string,
    public readonly departureId: string,
    public readonly customerId: string,
    public readonly slotsReserved: number,
    public readonly totalAmount: string,
    public readonly paidAmount?: string,
    public readonly notes?: string,
    public readonly source?: 'admin' | 'portal',
    public readonly createdById?: string
  ) {}

  static fromInput(input: any): CreateBookingCommand {
    return new CreateBookingCommand(
      input.id,
      input.departureId,
      input.customerId,
      input.slotsReserved,
      input.totalAmount,
      input.paidAmount,
      input.notes,
      input.source,
      input.createdById
    );
  }
}
