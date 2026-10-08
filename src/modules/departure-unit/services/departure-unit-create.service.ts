import type { CreateDepartureUnitCommand } from '../commands/create-departure-unit.command';
import type { DepartureUnitRepository } from '../repositories/departure-unit.repository';
import type { DepartureRepository } from '@/modules/departure/repositories/departure.repository';
import type { TransportUnitRepository } from '@/modules/transport-unit/repositories/transport-unit.repository';
import type { DepartureUnitRow } from '../models/departure-unit.model';
import { DepartureUnitAlreadyAssignedException } from '../exceptions/departure-unit-already-assigned.exception';
import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureUnitCreateService {
  constructor(
    private readonly repository: DepartureUnitRepository,
    private readonly departureRepository: DepartureRepository,
    private readonly transportUnitRepository: TransportUnitRepository,
  ) {}

  async execute(command: CreateDepartureUnitCommand): Promise<DepartureUnitRow> {
    const departure = await this.departureRepository.findOrFail(
      command.departureId,
    );

    if (departure.status === 'completed' || departure.status === 'cancelled') {
      throw new DomainError(
        'No se pueden asignar unidades a una salida completada o cancelada.',
      );
    }

    const transportUnit = await this.transportUnitRepository.findOrFail(
      command.transportUnitId,
    );

    if (transportUnit.status !== 'active') {
      throw new DomainError(
        'Solo se pueden asignar unidades de transporte en estado activo.',
      );
    }

    const existing = await this.repository.findByDepartureAndUnit(
      command.departureId,
      command.transportUnitId,
    );
    if (existing) {
      throw new DepartureUnitAlreadyAssignedException();
    }

    const row = await this.repository.create({
      departureId: command.departureId,
      transportUnitId: command.transportUnitId,
      assignedCapacity: command.assignedCapacity,
      driverNameOverride: command.driverNameOverride,
      driverPhoneOverride: command.driverPhoneOverride,
      notes: command.notes,
    });

    const newTotalCapacity =
      await this.repository.calculateTotalCapacityForDeparture(
        command.departureId,
      );
    await this.departureRepository.updateCapacity(
      command.departureId,
      newTotalCapacity,
    );

    return row;
  }
}
