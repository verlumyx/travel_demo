import type { CreateTransportUnitCommand } from '../commands/create-transport-unit.command';
import type { TransportUnitRepository } from '../repositories/transport-unit.repository';
import type { TransportUnitRow } from '../models/transport-unit.model';

export class TransportUnitCreateService {
  constructor(private readonly repository: TransportUnitRepository) {}

  async execute(command: CreateTransportUnitCommand): Promise<TransportUnitRow> {
    return this.repository.create({
      id: command.id,
      name: command.name,
      type: command.type,
      plateNumber: command.plateNumber,
      capacity: command.capacity,
      driverName: command.driverName,
      driverPhone: command.driverPhone,
      notes: command.notes,
    });
  }
}
