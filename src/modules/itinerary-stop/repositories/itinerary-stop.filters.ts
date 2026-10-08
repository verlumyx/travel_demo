import { eq } from 'drizzle-orm';
import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { itineraryStops } from '../models/itinerary-stop.model';

export const itineraryStopFilterMap: FilterMap<typeof itineraryStops> = {
  tourId: (value: string) => eq(itineraryStops.tourId, value),
  destinationId: (value: string) => eq(itineraryStops.destinationId, value),
};
