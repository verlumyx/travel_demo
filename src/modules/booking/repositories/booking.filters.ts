import { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { bookings } from '../models/booking.model';
import { ilike, or, eq } from 'drizzle-orm';

export const bookingFilters: FilterMap<typeof bookings> = {
  q: (value: string) => ilike(bookings.code, `%${value}%`),
  status: (value: string) => eq(bookings.status, value as any),
  departureId: (value: string) => eq(bookings.departureId, value),
  customerId: (value: string) => eq(bookings.customerId, value)
};
