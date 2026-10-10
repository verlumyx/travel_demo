import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleTourRepository } from './repositories/drizzle-tour.repository';
import { TourCreateService } from './services/tour-create.service';
import { TourUpdateService } from './services/tour-update.service';
import { TourUpdateStatusService } from './services/tour-update-status.service';
import { TourFindService } from './services/tour-find.service';
import { TourSearchService } from './services/tour-search.service';
import { TourCatalogService } from './services/tour-catalog.service';

import { db as defaultDb } from '@/db/client';

export function createTourContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleTourRepository(db);
  return {
    repository,
    createService: new TourCreateService(repository),
    updateService: new TourUpdateService(repository),
    updateStatusService: new TourUpdateStatusService(repository),
    findService: new TourFindService(repository),
    searchService: new TourSearchService(repository),
    catalogService: new TourCatalogService(repository),
  };
}
