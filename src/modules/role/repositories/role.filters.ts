import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { ilike, eq } from 'drizzle-orm';
import { app_roles } from '../models/role.model';

const table = app_roles;

export const roleFilters: FilterMap = {
  name: (val) => ilike(table.name, `%${val}%`),
  status: (val) => eq(table.status, val as any),
};
