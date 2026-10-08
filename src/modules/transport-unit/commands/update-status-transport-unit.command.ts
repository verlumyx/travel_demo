export class UpdateStatusTransportUnitCommand {
  private constructor(
    public readonly id: string,
    public readonly status: 'active' | 'inactive' | 'maintenance',
  ) {}

  static fromInput(id: string, input: any): UpdateStatusTransportUnitCommand {
    return new UpdateStatusTransportUnitCommand(
      id,
      input.status,
    );
  }
}
