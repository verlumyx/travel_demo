import { type FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_payment_methods } from '../models/payment-method.model';
import { ilike, or, eq } from 'drizzle-orm';

export const paymentMethodFilters: FilterMap<typeof app_payment_methods> = {
  q: (value: string) =>
    or(
      ilike(app_payment_methods.name, `%${value}%`),
      ilike(app_payment_methods.code, `%${value}%`),
      ilike(app_payment_methods.currency, `%${value}%`),
      ilike(app_payment_methods.instructions, `%${value}%`),
    ),
  code: (value: string) => ilike(app_payment_methods.code, `%${value}%`),
  currency: (value: string) => eq(app_payment_methods.currency, value),
  status: (value: string) => eq(app_payment_methods.status, value as 'active' | 'inactive'),
};
