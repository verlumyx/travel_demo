export type CreatePassengerItem = {
  firstName: string;
  lastName: string;
  documentType?: 'cedula' | 'passport' | 'other' | null;
  documentNumber?: string | null;
  phone?: string | null;
  isMainContact?: boolean;
  notes?: string | null;
};

export class CreateBookingCommand {
  private constructor(
    public readonly id: string,
    public readonly departureId: string,
    public readonly customerId: string,
    public readonly slotsReserved: number,
    public readonly totalAmount: string,
    public readonly paidAmount: string,
    public readonly passengers: CreatePassengerItem[],
    public readonly notes?: string,
    public readonly source: 'admin' | 'portal' = 'admin',
    public readonly createdById?: string,
  ) {}

  static fromInput(input: any): CreateBookingCommand {
    return new CreateBookingCommand(
      input.id,
      input.departureId,
      input.customerId,
      Number(input.slotsReserved),
      String(input.totalAmount),
      String(input.paidAmount || '0'),
      Array.isArray(input.passengers) ? input.passengers : [],
      input.notes || undefined,
      input.source || 'admin',
      input.createdById || undefined,
    );
  }
}
