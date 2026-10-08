import type { CreateDepartureCommand } from '../commands/create-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureCreateService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(command: CreateDepartureCommand): Promise<DepartureRow> {
    return this.repository.create({
      id: command.id,
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
