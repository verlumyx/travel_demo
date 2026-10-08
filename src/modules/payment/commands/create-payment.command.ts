export class CreatePaymentCommand {
  private constructor(
    public readonly id: string,
    public readonly bookingId: string,
    public readonly method: 'pago_movil' | 'zelle' | 'binance' | 'zinli' | 'bank_transfer' | 'cash_usd' | 'cash_ves',
    public readonly amount: string,
    public readonly currency: string,
    public readonly paymentDate: Date,
    public readonly reference?: string,
    public readonly proofImageUrl?: string,
    public readonly receivedByName?: string,
    public readonly verifiedById?: string,
    public readonly verifiedAt?: Date,
    public readonly notes?: string
  ) {}

  static fromInput(input: any): CreatePaymentCommand {
    return new CreatePaymentCommand(
      input.id,
      input.bookingId,
      input.method,
      input.amount,
      input.currency || 'USD',
      input.paymentDate,
      input.reference,
      input.proofImageUrl,
      input.receivedByName,
      input.verifiedById,
      input.verifiedAt,
      input.notes
    );
  }
}
