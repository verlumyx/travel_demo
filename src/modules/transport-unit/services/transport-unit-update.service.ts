import type { UpdateTransportUnitCommand } from '../commands/update-transport-unit.command';
import type { TransportUnitRepository } from '../repositories/transport-unit.repository';
import type { TransportUnitRow } from '../models/transport-unit.model';

export class TransportUnitUpdateService {
  constructor(private readonly repository: TransportUnitRepository) {}

  async execute(command: UpdateTransportUnitCommand): Promise<TransportUnitRow> {
    const unit = await this.repository.findOrFail(command.id);

    return this.repository.update(unit.id, {
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
