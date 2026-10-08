import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { ilike, eq } from 'drizzle-orm';
import { app_destinations } from '../models/destination.model';

const table = app_destinations;

export const destinationFilters: FilterMap = {
  name: (val) => ilike(table.name, `%${val}%`),  country: (val) => eq(table.country, val as string),  status: (val) => eq(table.status, val as any),
};
