import type { TransportUnitRow } from '../models/transport-unit.model';

export function toTransportUnitDto(row: TransportUnitRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
