import type { CreateItineraryStopCommand } from '../commands/create-itinerary-stop.command';
import type { ItineraryStopRepository } from '../repositories/itinerary-stop.repository';
import type { ItineraryStopRow } from '../models/itinerary-stop.model';

export class ItineraryStopCreateService {
  constructor(private readonly repository: ItineraryStopRepository) {}

  async execute(command: CreateItineraryStopCommand): Promise<ItineraryStopRow> {
    return this.repository.create({
      tourId: command.tourId,
      destinationId: command.destinationId,
      dayNumber: command.dayNumber,
      sortOrder: command.sortOrder,
      title: command.title,
      description: command.description,
      overnightStay: command.overnightStay,
    });
  }
}
