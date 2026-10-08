import type { DepartureRow, NewDepartureRow } from '../models/departure.model';

export interface DepartureRepository {
  create(data: Omit<NewDepartureRow, 'code' | 'status' | 'bookedSlots' | 'createdAt' | 'updatedAt'>): Promise<DepartureRow>;
  findById(id: string): Promise<DepartureRow | null>;
  findOrFail(id: string): Promise<DepartureRow>;
  update(id: string, data: Partial<NewDepartureRow>): Promise<DepartureRow>;
  updateStatus(id: string, status: DepartureRow['status']): Promise<DepartureRow>;
  search(filters: { q?: string; status?: string; tourId?: string }, limit: number, offset: number): Promise<{ items: DepartureRow[]; total: number }>;
}
