import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { customers } from '../models/customer.model';
import { ilike, or, eq } from 'drizzle-orm';

export const customerFilters: FilterMap<typeof customers> = {
  q: (value: string) =>
    or(
      ilike(customers.firstName, `%${value}%`),
      ilike(customers.lastName, `%${value}%`),
      ilike(customers.code, `%${value}%`),
      ilike(customers.email, `%${value}%`),
      ilike(customers.phone, `%${value}%`),
      ilike(customers.documentNumber, `%${value}%`),
    ),
  status: (value: string) => eq(customers.status, value as 'active' | 'inactive'),
};
