import { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { payments } from '../models/payment.model';
import { ilike, eq, or } from 'drizzle-orm';

export const paymentFilters: FilterMap<typeof payments> = {
  q: (value: string) =>
    or(
      ilike(payments.code, `%${value}%`),
      ilike(payments.reference, `%${value}%`),
      ilike(payments.receivedByName, `%${value}%`),
    ),
  status: (value: string) => eq(payments.status, value as any),
  method: (value: string) => eq(payments.method, value as any),
  bookingId: (value: string) => eq(payments.bookingId, value),
};
