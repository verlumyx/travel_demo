import type { DepartureUnitRow, NewDepartureUnitRow } from '../models/departure-unit.model';

export interface DepartureUnitRepository {
  create(data: Omit<NewDepartureUnitRow, 'id' | 'createdAt'>): Promise<DepartureUnitRow>;
  findById(id: string): Promise<DepartureUnitRow | null>;
  findOrFail(id: string): Promise<DepartureUnitRow>;
  update(id: string, data: Partial<NewDepartureUnitRow>): Promise<DepartureUnitRow>;
  search(filters: { departureId?: string; transportUnitId?: string }, limit: number, offset: number): Promise<{ items: DepartureUnitRow[]; total: number }>;
}
