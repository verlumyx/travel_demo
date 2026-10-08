import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { ilike, eq, or } from 'drizzle-orm';
import { app_tours } from '../models/tour.model';

export const tourFilters: FilterMap<typeof app_tours> = {
  q: (val: string) =>
    or(
      ilike(app_tours.name, `%${val}%`),
      ilike(app_tours.code, `%${val}%`),
      ilike(app_tours.slug, `%${val}%`),
    ),
  name: (val: string) => ilike(app_tours.name, `%${val}%`),
  status: (val: string) => eq(app_tours.status, val as 'draft' | 'active' | 'inactive'),
};
