import type { SystemLogRepository } from '../repositories/system-log.repository';
import type { SystemLogRow } from '../models/system-log.model';

export class SystemLogFindService {
  constructor(private readonly repository: SystemLogRepository) {}

  async execute(id: string): Promise<SystemLogRow | null> {
    return this.repository.findById(id);
  }
}
