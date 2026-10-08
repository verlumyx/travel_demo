import { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { passengers } from '../models/passenger.model';
import { ilike, or, eq } from 'drizzle-orm';

export const passengerFilters: FilterMap<typeof passengers> = {
  q: (value: string) => or(
    ilike(passengers.firstName, `%${value}%`),
    ilike(passengers.lastName, `%${value}%`),
    ilike(passengers.documentNumber, `%${value}%`)
  ),
  bookingId: (value: string) => eq(passengers.bookingId, value)
};
