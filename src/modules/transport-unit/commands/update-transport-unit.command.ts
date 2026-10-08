export class UpdateTransportUnitCommand {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: 'bus' | 'minibus' | 'van' | 'boat' | 'other',
    public readonly plateNumber: string | null,
    public readonly capacity: number,
    public readonly driverName: string | null,
    public readonly driverPhone: string | null,
    public readonly notes: string | null,
  ) {}

  static fromInput(id: string, input: any): UpdateTransportUnitCommand {
    return new UpdateTransportUnitCommand(
      id,
      input.name,
      input.type,
      input.plateNumber ?? null,
      input.capacity,
      input.driverName ?? null,
      input.driverPhone ?? null,
      input.notes ?? null,
    );
  }
}
