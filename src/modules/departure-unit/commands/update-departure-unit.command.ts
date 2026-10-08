export class UpdateDepartureUnitCommand {
  private constructor(
    public readonly id: string,
    public readonly departureId: string,
    public readonly transportUnitId: string,
    public readonly assignedCapacity: number,
    public readonly driverNameOverride: string | null,
    public readonly driverPhoneOverride: string | null,
    public readonly notes: string | null,
  ) {}

  static fromInput(id: string, input: any): UpdateDepartureUnitCommand {
    return new UpdateDepartureUnitCommand(
      id,
      input.departureId,
      input.transportUnitId,
      input.assignedCapacity,
      input.driverNameOverride ?? null,
      input.driverPhoneOverride ?? null,
      input.notes ?? null,
    );
  }
}
