import type { TransportUnitRow } from '../models/transport-unit.model';

export type TransportUnitDto = {
  id: string;
  code: string;
  name: string;
  type: 'bus' | 'minibus' | 'van' | 'boat' | 'other';
  plateNumber: string | null;
  capacity: number;
  driverName: string | null;
  driverPhone: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string | null;
};

export function toTransportUnitDto(row: TransportUnitRow): TransportUnitDto {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
