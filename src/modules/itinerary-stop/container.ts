import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleItineraryStopRepository } from './repositories/drizzle-itinerary-stop.repository';
import { ItineraryStopCreateService } from './services/itinerary-stop-create.service';
import { ItineraryStopUpdateService } from './services/itinerary-stop-update.service';
import { ItineraryStopFindService } from './services/itinerary-stop-find.service';
import { ItineraryStopSearchService } from './services/itinerary-stop-search.service';

export function createItineraryStopContainer(db: DbExecutor) {
  const repository = new DrizzleItineraryStopRepository(db);
  return {
    createService: new ItineraryStopCreateService(repository),
    updateService: new ItineraryStopUpdateService(repository),
    findService: new ItineraryStopFindService(repository),
    searchService: new ItineraryStopSearchService(repository),
  };
}
