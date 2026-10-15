import type { SystemLogRepository } from '../repositories/system-log.repository';
import type { SystemLogFilters } from '../repositories/system-log.filters';
import type { SystemLogRow } from '../models/system-log.model';

export class SystemLogSearchService {
  constructor(private readonly repository: SystemLogRepository) {}

  async execute(filters: SystemLogFilters): Promise<{ items: SystemLogRow[]; total: number }> {
    return this.repository.search(filters);
  }
}
