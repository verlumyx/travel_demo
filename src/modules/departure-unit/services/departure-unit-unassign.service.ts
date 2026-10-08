import type { DepartureUnitRepository } from '../repositories/departure-unit.repository';
import type { DepartureRepository } from '@/modules/departure/repositories/departure.repository';
import { DepartureCapacityConflictException } from '@/modules/departure/exceptions/departure-capacity-conflict.exception';
import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureUnitUnassignService {
  constructor(
    private readonly repository: DepartureUnitRepository,
    private readonly departureRepository: DepartureRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const currentUnit = await this.repository.findOrFail(id);
    const departure = await this.departureRepository.findOrFail(
      currentUnit.departureId,
    );

    if (departure.status === 'completed' || departure.status === 'cancelled') {
      throw new DomainError(
        'No se pueden desvincular unidades de una salida completada o cancelada.',
      );
    }

    const projectedCapacity =
      departure.totalCapacity - currentUnit.assignedCapacity;

    if (projectedCapacity < departure.bookedSlots) {
      throw new DepartureCapacityConflictException(
        `No se puede desvincular la unidad porque la capacidad restante (${projectedCapacity}) sería inferior a los cupos ya reservados (${departure.bookedSlots}).`,
      );
    }

    await this.repository.softDelete(id);

    const newTotalCapacity =
      await this.repository.calculateTotalCapacityForDeparture(departure.id);
    await this.departureRepository.updateCapacity(departure.id, newTotalCapacity);
  }
}
