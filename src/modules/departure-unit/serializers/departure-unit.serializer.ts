import type { DepartureUnitRow } from '../models/departure-unit.model';

export function toDepartureUnitDto(row: DepartureUnitRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
  };
}
