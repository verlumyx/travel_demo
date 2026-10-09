import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleUserRepository } from './repositories/drizzle-user.repository';
import { UserCreateService } from './services/user-create.service';
import { UserUpdateService } from './services/user-update.service';
import { UserUpdateStatusService } from './services/user-update-status.service';
import { UserFindService } from './services/user-find.service';
import { UserSearchService } from './services/user-search.service';

export function createUserContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleUserRepository(db);
  return {
    repository,
    createService: new UserCreateService(repository),
    updateService: new UserUpdateService(repository),
    updateStatusService: new UserUpdateStatusService(repository),
    findService: new UserFindService(repository),
    searchService: new UserSearchService(repository),
  };
}
