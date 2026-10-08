import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { ilike, eq } from 'drizzle-orm';
import { app_tours } from '../models/tour.model';

const table = app_tours;

export const tourFilters: FilterMap = {
  name: (val) => ilike(table.name, `%${val}%`),  status: (val) => eq(table.status, val as any),
};
