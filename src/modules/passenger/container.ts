import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzlePassengerRepository } from './repositories/drizzle-passenger.repository';
import { PassengerCreateService } from './services/passenger-create.service';
import { PassengerUpdateService } from './services/passenger-update.service';
import { PassengerFindService } from './services/passenger-find.service';
import { PassengerSearchService } from './services/passenger-search.service';

export function createPassengerContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzlePassengerRepository(db);
  return {
    repository,
    createService: new PassengerCreateService(repository),
    updateService: new PassengerUpdateService(repository),
    findService: new PassengerFindService(repository),
    searchService: new PassengerSearchService(repository),
  };
}
