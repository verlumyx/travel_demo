import type { ItineraryStopRow, NewItineraryStopRow } from '../models/itinerary-stop.model';

export interface ItineraryStopRepository {
  create(data: Omit<NewItineraryStopRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItineraryStopRow>;
  findById(id: string): Promise<ItineraryStopRow | null>;
  findOrFail(id: string): Promise<ItineraryStopRow>;
  update(id: string, data: Partial<NewItineraryStopRow>): Promise<ItineraryStopRow>;
  search(filters: { tourId?: string; destinationId?: string }, limit: number, offset: number): Promise<{ items: ItineraryStopRow[]; total: number }>;
}
