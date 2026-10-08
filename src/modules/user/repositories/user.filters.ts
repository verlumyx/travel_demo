import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { ilike, eq } from 'drizzle-orm';
import { app_users } from '../models/user.model';

const table = app_users;

export const userFilters: FilterMap = {
  name: (val) => ilike(table.name, `%${val}%`),  email: (val) => ilike(table.email, `%${val}%`),  roleId: (val) => eq(table.roleId, val as string),  status: (val) => eq(table.status, val as any),
};
