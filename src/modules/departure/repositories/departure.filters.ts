import { eq, ilike, or } from 'drizzle-orm';
import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { departures } from '../models/departure.model';

export const departureFilterMap: FilterMap<typeof departures> = {
  q: (value: string) => ilike(departures.code, `%${value}%`),
  status: (value: string) => eq(departures.status, value as any),
  tourId: (value: string) => eq(departures.tourId, value),
};
