import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleRoleRepository } from './repositories/drizzle-role.repository';
import { RoleCreateService } from './services/role-create.service';
import { RoleUpdateService } from './services/role-update.service';
import { RoleUpdateStatusService } from './services/role-update-status.service';
import { RoleFindService } from './services/role-find.service';
import { RoleSearchService } from './services/role-search.service';

export function createRoleContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleRoleRepository(db);
  return {
    repository,
    createService: new RoleCreateService(repository),
    updateService: new RoleUpdateService(repository),
    updateStatusService: new RoleUpdateStatusService(repository),
    findService: new RoleFindService(repository),
    searchService: new RoleSearchService(repository),
  };
}
