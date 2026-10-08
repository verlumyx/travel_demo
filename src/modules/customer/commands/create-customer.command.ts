export class CreateCustomerCommand {
  private constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly documentType?: 'cedula' | 'passport' | 'other',
    public readonly documentNumber?: string,
    public readonly birthDate?: Date,
    public readonly emergencyContact?: string,
    public readonly emergencyPhone?: string,
    public readonly notes?: string,
    public readonly source?: 'admin' | 'portal' | 'whatsapp' | 'instagram',
    public readonly supabaseUserId?: string,
  ) {}

  static fromInput(input: any): CreateCustomerCommand {
    return new CreateCustomerCommand(
      input.id,
      input.firstName,
      input.lastName,
      input.email || undefined,
      input.phone || undefined,
      input.documentType || undefined,
      input.documentNumber || undefined,
      input.birthDate ? new Date(input.birthDate) : undefined,
      input.emergencyContact || undefined,
      input.emergencyPhone || undefined,
      input.notes || undefined,
      input.source || 'admin',
      input.supabaseUserId || undefined,
    );
  }
}
