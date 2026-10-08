import type { UpdateDepartureCommand } from '../commands/update-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureUpdateService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(command: UpdateDepartureCommand): Promise<DepartureRow> {
    const departure = await this.repository.findOrFail(command.id);

    return this.repository.update(departure.id, {
      tourId: command.tourId,
      departureDate: command.departureDate,
      returnDate: command.returnDate,
      meetingPoint: command.meetingPoint,
      meetingTime: command.meetingTime,
      priceOverride: command.priceOverride,
      totalCapacity: command.totalCapacity,
      notes: command.notes,
    });
  }
}
