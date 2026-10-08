export class UpdateStatusDepartureCommand {
  private constructor(
    public readonly id: string,
    public readonly status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  ) {}

  static fromInput(id: string, input: any): UpdateStatusDepartureCommand {
    return new UpdateStatusDepartureCommand(
      id,
      input.status,
    );
  }
}
