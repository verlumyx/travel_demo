import { eq } from 'drizzle-orm';
import type { FilterMap } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { departureUnits } from '../models/departure-unit.model';

export const departureUnitFilterMap: FilterMap<typeof departureUnits> = {
  departureId: (value: string) => eq(departureUnits.departureId, value),
  transportUnitId: (value: string) => eq(departureUnits.transportUnitId, value),
};
