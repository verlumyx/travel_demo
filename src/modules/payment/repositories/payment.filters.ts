import { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { payments } from '../models/payment.model';
import { ilike, eq } from 'drizzle-orm';

export const paymentFilters: FilterMap<typeof payments> = {
  q: (value: string) => ilike(payments.code, `%${value}%`),
  status: (value: string) => eq(payments.status, value as any),
  bookingId: (value: string) => eq(payments.bookingId, value)
};
