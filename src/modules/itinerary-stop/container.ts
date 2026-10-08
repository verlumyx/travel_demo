import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleItineraryStopRepository } from './repositories/drizzle-itinerary-stop.repository';
import { ItineraryStopCreateService } from './services/itinerary-stop-create.service';
import { ItineraryStopUpdateService } from './services/itinerary-stop-update.service';
import { ItineraryStopFindService } from './services/itinerary-stop-find.service';
import { ItineraryStopSearchService } from './services/itinerary-stop-search.service';

import { db as defaultDb } from '@/db/client';

export function createItineraryStopContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleItineraryStopRepository(db);
  return {
    repository,
    createService: new ItineraryStopCreateService(repository),
    updateService: new ItineraryStopUpdateService(repository),
    findService: new ItineraryStopFindService(repository),
    searchService: new ItineraryStopSearchService(repository),
  };
}
