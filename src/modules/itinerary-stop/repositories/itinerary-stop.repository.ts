import type { ItineraryStopRow, NewItineraryStopRow } from '../models/itinerary-stop.model';

export interface ItineraryStopWithTourRow {
  stopId: string;
  dayNumber: number;
  title: string;
  tourId: string;
  tourName: string;
  tourCode: string;
}

export interface ItineraryStopDetailRow {
  id: string;
  dayNumber: number;
  sortOrder: number;
  title: string;
  description: string | null;
  overnightStay: boolean;
  destinationName: string;
  destinationState: string | null;
  destinationCity: string | null;
  categoryName: string | null;
}

export interface ItineraryStopRepository {
  create(data: Omit<NewItineraryStopRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItineraryStopRow>;
  findById(id: string): Promise<ItineraryStopRow | null>;
  findOrFail(id: string): Promise<ItineraryStopRow>;
  update(id: string, data: Partial<NewItineraryStopRow>): Promise<ItineraryStopRow>;
  search(filters: { tourId?: string; destinationId?: string }, limit: number, offset: number): Promise<{ items: ItineraryStopRow[]; total: number }>;
  findByTourId(tourId: string): Promise<ItineraryStopRow[]>;
  findByDestinationIdWithTour(destinationId: string): Promise<ItineraryStopWithTourRow[]>;
  findByTourIdWithDetails(tourId: string): Promise<ItineraryStopDetailRow[]>;
}
