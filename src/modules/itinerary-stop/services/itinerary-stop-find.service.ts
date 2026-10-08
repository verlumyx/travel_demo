import type { ItineraryStopRepository } from '../repositories/itinerary-stop.repository';
import type { ItineraryStopRow } from '../models/itinerary-stop.model';

export class ItineraryStopFindService {
  constructor(private readonly repository: ItineraryStopRepository) {}

  async execute(id: string): Promise<ItineraryStopRow> {
    return this.repository.findOrFail(id);
  }

  async findByTourId(tourId: string): Promise<ItineraryStopRow[]> {
    return this.repository.findByTourId(tourId);
  }
}
