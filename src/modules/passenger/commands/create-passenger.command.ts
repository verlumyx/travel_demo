export class CreatePassengerCommand {
  private constructor(
    public readonly bookingId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentType?: 'cedula' | 'passport' | 'other',
    public readonly documentNumber?: string,
    public readonly phone?: string,
    public readonly isMainContact?: boolean,
    public readonly notes?: string
  ) {}

  static fromInput(input: any): CreatePassengerCommand {
    return new CreatePassengerCommand(
      input.bookingId,
      input.firstName,
      input.lastName,
      input.documentType,
      input.documentNumber,
      input.phone,
      input.isMainContact,
      input.notes
    );
  }
}
