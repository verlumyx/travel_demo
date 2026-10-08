import { eq, ilike, or } from 'drizzle-orm';
import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { transportUnits } from '../models/transport-unit.model';

export const transportUnitFilterMap: FilterMap<typeof transportUnits> = {
  q: (value: string) => or(
    ilike(transportUnits.name, `%${value}%`),
    ilike(transportUnits.code, `%${value}%`)
  ),
  status: (value: string) => eq(transportUnits.status, value as any),
  type: (value: string) => eq(transportUnits.type, value as any),
};
