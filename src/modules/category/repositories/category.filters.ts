import { type FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_categories } from '../models/category.model';
import { ilike, or, eq } from 'drizzle-orm';

export const categoryFilters: FilterMap<typeof app_categories> = {
  q: (value: string) =>
    or(
      ilike(app_categories.name, `%${value}%`),
      ilike(app_categories.slug, `%${value}%`),
      ilike(app_categories.code, `%${value}%`),
    ),
  code: (value: string) => ilike(app_categories.code, `%${value}%`),
  status: (value: string) => eq(app_categories.status, value as 'active' | 'inactive'),
};
