import { eq, gte, ilike, lte, or } from 'drizzle-orm';
import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { departures } from '../models/departure.model';

export const departureFilterMap: FilterMap<typeof departures> = {
  q: (value: string) =>
    or(
      ilike(departures.code, `%${value}%`),
      ilike(departures.meetingPoint, `%${value}%`),
      ilike(departures.notes, `%${value}%`),
    ),
  status: (value: string) => eq(departures.status, value as any),
  tourId: (value: string) => eq(departures.tourId, value),
  from: (value: string) => gte(departures.departureDate, new Date(value)),
  to: (value: string) => lte(departures.departureDate, new Date(value)),
};
