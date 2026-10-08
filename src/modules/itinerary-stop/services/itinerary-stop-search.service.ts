import type { SearchItineraryStopCommand } from '../commands/search-itinerary-stop.command';
import type { ItineraryStopRepository } from '../repositories/itinerary-stop.repository';
import type { ItineraryStopRow } from '../models/itinerary-stop.model';

export class ItineraryStopSearchService {
  constructor(private readonly repository: ItineraryStopRepository) {}

  async execute(command: SearchItineraryStopCommand): Promise<{ items: ItineraryStopRow[]; total: number }> {
    return this.repository.search(command.filters, command.limit, command.offset);
  }
}
