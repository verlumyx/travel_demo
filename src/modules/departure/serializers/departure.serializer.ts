import type { DepartureRow } from '../models/departure.model';

export function toDepartureDto(row: DepartureRow) {
  return {
    ...row,
    departureDate: row.departureDate.toISOString(),
    returnDate: row.returnDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
