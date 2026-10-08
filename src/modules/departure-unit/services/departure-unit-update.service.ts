import type { UpdateDepartureUnitCommand } from '../commands/update-departure-unit.command';
import type { DepartureUnitRepository } from '../repositories/departure-unit.repository';
import type { DepartureUnitRow } from '../models/departure-unit.model';

export class DepartureUnitUpdateService {
  constructor(private readonly repository: DepartureUnitRepository) {}

  async execute(command: UpdateDepartureUnitCommand): Promise<DepartureUnitRow> {
    const departureUnit = await this.repository.findOrFail(command.id);

    return this.repository.update(departureUnit.id, {
      departureId: command.departureId,
      transportUnitId: command.transportUnitId,
      assignedCapacity: command.assignedCapacity,
      driverNameOverride: command.driverNameOverride,
      driverPhoneOverride: command.driverPhoneOverride,
      notes: command.notes,
    });
  }
}
