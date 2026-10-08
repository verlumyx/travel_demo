export class CreateTransportUnitCommand {
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

  static fromInput(input: any): CreateTransportUnitCommand {
    return new CreateTransportUnitCommand(
      input.id,
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
