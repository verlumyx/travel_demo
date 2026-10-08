import type { CreateDepartureUnitCommand } from '../commands/create-departure-unit.command';
import type { DepartureUnitRepository } from '../repositories/departure-unit.repository';
import type { DepartureUnitRow } from '../models/departure-unit.model';

export class DepartureUnitCreateService {
  constructor(private readonly repository: DepartureUnitRepository) {}

  async execute(command: CreateDepartureUnitCommand): Promise<DepartureUnitRow> {
    return this.repository.create({
      departureId: command.departureId,
      transportUnitId: command.transportUnitId,
      assignedCapacity: command.assignedCapacity,
      driverNameOverride: command.driverNameOverride,
      driverPhoneOverride: command.driverPhoneOverride,
      notes: command.notes,
    });
  }
}
