import type { DepartureUnitRow, NewDepartureUnitRow } from '../models/departure-unit.model';

export type DepartureUnitWithDetailsRow = DepartureUnitRow & {
  unitCode: string;
  unitName: string;
  unitType: string;
  unitPlateNumber: string | null;
  unitTotalCapacity: number;
  unitDefaultDriver: string | null;
  unitDefaultPhone: string | null;
};

export interface DepartureUnitRepository {
  create(
    data: Omit<NewDepartureUnitRow, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<DepartureUnitRow>;
  findById(id: string): Promise<DepartureUnitRow | null>;
  findOrFail(id: string): Promise<DepartureUnitRow>;
  update(id: string, data: Partial<NewDepartureUnitRow>): Promise<DepartureUnitRow>;
  softDelete(id: string): Promise<void>;
  findByDepartureId(departureId: string): Promise<DepartureUnitWithDetailsRow[]>;
  findByDepartureAndUnit(
    departureId: string,
    transportUnitId: string,
  ): Promise<DepartureUnitRow | null>;
  calculateTotalCapacityForDeparture(departureId: string): Promise<number>;
  search(
    filters: { departureId?: string; transportUnitId?: string },
    limit: number,
    offset: number,
  ): Promise<{ items: DepartureUnitRow[]; total: number }>;
}
