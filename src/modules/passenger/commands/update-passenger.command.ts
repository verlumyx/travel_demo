export class UpdatePassengerCommand {
  private constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentType?: 'cedula' | 'passport' | 'other',
    public readonly documentNumber?: string,
    public readonly phone?: string,
    public readonly isMainContact?: boolean,
    public readonly notes?: string
  ) {}

  static fromInput(id: string, input: any): UpdatePassengerCommand {
    return new UpdatePassengerCommand(
      id,
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
