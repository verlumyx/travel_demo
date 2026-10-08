export class CreateDepartureUnitCommand {
  private constructor(
    public readonly departureId: string,
    public readonly transportUnitId: string,
    public readonly assignedCapacity: number,
    public readonly driverNameOverride: string | null,
    public readonly driverPhoneOverride: string | null,
    public readonly notes: string | null,
  ) {}

  static fromInput(input: any): CreateDepartureUnitCommand {
    return new CreateDepartureUnitCommand(
      input.departureId,
      input.transportUnitId,
      Number(input.assignedCapacity),
      input.driverNameOverride || null,
      input.driverPhoneOverride || null,
      input.notes || null,
    );
  }
}
