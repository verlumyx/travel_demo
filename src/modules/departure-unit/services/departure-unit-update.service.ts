import type { UpdateDepartureUnitCommand } from '../commands/update-departure-unit.command';
import type { DepartureUnitRepository } from '../repositories/departure-unit.repository';
import type { DepartureRepository } from '@/modules/departure/repositories/departure.repository';
import type { DepartureUnitRow } from '../models/departure-unit.model';
import { DepartureCapacityConflictException } from '@/modules/departure/exceptions/departure-capacity-conflict.exception';
import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureUnitUpdateService {
  constructor(
    private readonly repository: DepartureUnitRepository,
    private readonly departureRepository: DepartureRepository,
  ) {}

  async execute(
    id: string,
    command: UpdateDepartureUnitCommand,
  ): Promise<DepartureUnitRow> {
    const currentUnit = await this.repository.findOrFail(id);
    const departure = await this.departureRepository.findOrFail(
      currentUnit.departureId,
    );

    if (departure.status === 'completed' || departure.status === 'cancelled') {
      throw new DomainError(
        'No se pueden modificar unidades de una salida completada o cancelada.',
      );
    }

    const projectedCapacity =
      departure.totalCapacity -
      currentUnit.assignedCapacity +
      command.assignedCapacity;

    if (projectedCapacity < departure.bookedSlots) {
      throw new DepartureCapacityConflictException(
        `No se puede reducir la capacidad a ${command.assignedCapacity} porque la nueva capacidad total (${projectedCapacity}) sería inferior a los cupos ya reservados (${departure.bookedSlots}).`,
      );
    }

    const row = await this.repository.update(id, {
      assignedCapacity: command.assignedCapacity,
      driverNameOverride: command.driverNameOverride,
      driverPhoneOverride: command.driverPhoneOverride,
      notes: command.notes,
    });

    const newTotalCapacity =
      await this.repository.calculateTotalCapacityForDeparture(departure.id);
    await this.departureRepository.updateCapacity(departure.id, newTotalCapacity);

    return row;
  }
}
