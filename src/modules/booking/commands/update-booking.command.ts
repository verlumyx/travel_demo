export class UpdateBookingCommand {
  private constructor(
    public readonly id: string,
    public readonly notes?: string | null,
  ) {}

  static fromInput(id: string, input: { notes?: string | null }): UpdateBookingCommand {
    return new UpdateBookingCommand(id, input.notes);
  }
}
