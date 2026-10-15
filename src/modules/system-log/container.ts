import { db } from '@/db/client';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleSystemLogRepository } from './repositories/drizzle-system-log.repository';
import { SystemLogCreateService } from './services/system-log-create.service';
import { SystemLogSearchService } from './services/system-log-search.service';
import { SystemLogFindService } from './services/system-log-find.service';
import { SystemLogStatusService } from './services/system-log-status.service';

export function createSystemLogContainer(executor: DbExecutor = db) {
  const repository = new DrizzleSystemLogRepository(executor);
  return {
    repository,
    createService: new SystemLogCreateService(repository),
    searchService: new SystemLogSearchService(repository),
    findService: new SystemLogFindService(repository),
    statusService: new SystemLogStatusService(repository),
  };
}
