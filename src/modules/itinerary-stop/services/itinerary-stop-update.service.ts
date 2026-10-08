import type { UpdateItineraryStopCommand } from '../commands/update-itinerary-stop.command';
import type { ItineraryStopRepository } from '../repositories/itinerary-stop.repository';
import type { ItineraryStopRow } from '../models/itinerary-stop.model';

export class ItineraryStopUpdateService {
  constructor(private readonly repository: ItineraryStopRepository) {}

  async execute(command: UpdateItineraryStopCommand): Promise<ItineraryStopRow> {
    const stop = await this.repository.findOrFail(command.id);

    return this.repository.update(stop.id, {
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
