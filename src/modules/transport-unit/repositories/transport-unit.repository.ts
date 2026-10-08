import type { TransportUnitRow, NewTransportUnitRow } from '../models/transport-unit.model';

export interface TransportUnitRepository {
  create(data: Omit<NewTransportUnitRow, 'code' | 'status' | 'createdAt' | 'updatedAt'>): Promise<TransportUnitRow>;
  findById(id: string): Promise<TransportUnitRow | null>;
  findOrFail(id: string): Promise<TransportUnitRow>;
  update(id: string, data: Partial<NewTransportUnitRow>): Promise<TransportUnitRow>;
  updateStatus(id: string, status: TransportUnitRow['status']): Promise<TransportUnitRow>;
  search(filters: { q?: string; status?: string; type?: string }, limit: number, offset: number): Promise<{ items: TransportUnitRow[]; total: number }>;
  getActive(): Promise<TransportUnitRow[]>;
}
