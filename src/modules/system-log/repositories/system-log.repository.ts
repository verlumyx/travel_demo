import { SystemLogRow, NewSystemLogRow } from '../models/system-log.model';
import { SystemLogFilters } from './system-log.filters';

export interface SystemLogRepository {
  create(data: NewSystemLogRow): Promise<SystemLogRow>;
  findById(id: string): Promise<SystemLogRow | null>;
  search(filters: SystemLogFilters): Promise<{ items: SystemLogRow[]; total: number }>;
  updateStatus(id: string, status: 'unread' | 'investigating' | 'resolved'): Promise<SystemLogRow>;
  clearResolved(): Promise<number>;
}
