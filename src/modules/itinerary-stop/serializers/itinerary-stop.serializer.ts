import type { ItineraryStopRow } from '../models/itinerary-stop.model';

export function toItineraryStopDto(row: ItineraryStopRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
