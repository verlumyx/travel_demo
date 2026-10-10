import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleDepartureRepository } from './repositories/drizzle-departure.repository';
import { DepartureCreateService } from './services/departure-create.service';
import { DepartureUpdateService } from './services/departure-update.service';
import { DepartureUpdateStatusService } from './services/departure-update-status.service';
import { DepartureFindService } from './services/departure-find.service';
import { DepartureSearchService } from './services/departure-search.service';
import { DepartureUpcomingService } from './services/departure-upcoming.service';

export function createDepartureContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleDepartureRepository(db);
  return {
    repository,
    createService: new DepartureCreateService(repository),
    updateService: new DepartureUpdateService(repository),
    updateStatusService: new DepartureUpdateStatusService(repository),
    findService: new DepartureFindService(repository),
    searchService: new DepartureSearchService(repository),
    upcomingService: new DepartureUpcomingService(repository),
  };
}
