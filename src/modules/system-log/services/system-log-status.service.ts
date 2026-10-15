import type { SystemLogRepository } from '../repositories/system-log.repository';
import type { SystemLogRow } from '../models/system-log.model';

export class SystemLogStatusService {
  constructor(private readonly repository: SystemLogRepository) {}

  async execute(id: string, status: 'unread' | 'investigating' | 'resolved'): Promise<SystemLogRow> {
    return this.repository.updateStatus(id, status);
  }

  async clearResolved(): Promise<number> {
    return this.repository.clearResolved();
  }
}
