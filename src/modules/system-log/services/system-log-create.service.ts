import type { SystemLogRepository } from '../repositories/system-log.repository';
import type { NewSystemLogRow, SystemLogRow } from '../models/system-log.model';

export class SystemLogCreateService {
  constructor(private readonly repository: SystemLogRepository) {}

  async execute(input: Omit<NewSystemLogRow, 'id' | 'createdAt'>): Promise<SystemLogRow> {
    return this.repository.create({
      id: crypto.randomUUID(),
      level: input.level || 'error',
      source: input.source,
      message: input.message,
      errorName: input.errorName,
      stack: input.stack,
      path: input.path,
      action: input.action,
      context: input.context,
      ip: input.ip,
      userAgent: input.userAgent,
      status: input.status || 'unread',
      createdAt: new Date(),
    });
  }
}
