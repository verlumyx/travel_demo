import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { ilike, eq, or } from 'drizzle-orm';
import { app_destinations } from '../models/destination.model';

export const destinationFilters: FilterMap<typeof app_destinations> = {
  q: (val: string) =>
    or(
      ilike(app_destinations.name, `%${val}%`),
      ilike(app_destinations.code, `%${val}%`),
      ilike(app_destinations.slug, `%${val}%`),
      ilike(app_destinations.state, `%${val}%`),
      ilike(app_destinations.city, `%${val}%`),
    ),
  name: (val: string) => ilike(app_destinations.name, `%${val}%`),
  categoryId: (val: string) => eq(app_destinations.categoryId, val),
  country: (val: string) => eq(app_destinations.country, val),
  status: (val: string) => eq(app_destinations.status, val as 'active' | 'inactive'),
};
