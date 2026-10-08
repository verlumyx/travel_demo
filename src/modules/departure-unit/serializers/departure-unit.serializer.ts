import type { DepartureUnitWithDetailsRow } from '../repositories/departure-unit.repository';

export type DepartureUnitDto = {
  id: string;
  departureId: string;
  transportUnitId: string;
  assignedCapacity: number;
  driverNameOverride: string | null;
  driverPhoneOverride: string | null;
  notes: string | null;
  createdAt: string;
  unitCode: string;
  unitName: string;
  unitType: string;
  unitPlateNumber: string | null;
  unitTotalCapacity: number;
  unitDefaultDriver: string | null;
  unitDefaultPhone: string | null;
  effectiveDriver: string;
  effectivePhone: string;
};

export function toDepartureUnitDto(
  row: DepartureUnitWithDetailsRow,
): DepartureUnitDto {
  return {
    id: row.id,
    departureId: row.departureId,
    transportUnitId: row.transportUnitId,
    assignedCapacity: row.assignedCapacity,
    driverNameOverride: row.driverNameOverride,
    driverPhoneOverride: row.driverPhoneOverride,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    unitCode: row.unitCode,
    unitName: row.unitName,
    unitType: row.unitType,
    unitPlateNumber: row.unitPlateNumber,
    unitTotalCapacity: row.unitTotalCapacity,
    unitDefaultDriver: row.unitDefaultDriver,
    unitDefaultPhone: row.unitDefaultPhone,
    effectiveDriver:
      row.driverNameOverride || row.unitDefaultDriver || 'No asignado',
    effectivePhone:
      row.driverPhoneOverride || row.unitDefaultPhone || 'No asignado',
  };
}
