import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleDestinationRepository } from './repositories/drizzle-destination.repository';
import { DestinationCreateService } from './services/destination-create.service';
import { DestinationUpdateService } from './services/destination-update.service';
import { DestinationUpdateStatusService } from './services/destination-update-status.service';
import { DestinationFindService } from './services/destination-find.service';
import { DestinationSearchService } from './services/destination-search.service';

export function createDestinationContainer(db: DbExecutor) {
  const repository = new DrizzleDestinationRepository(db);
  return {
    createService: new DestinationCreateService(repository),
    updateService: new DestinationUpdateService(repository),
    updateStatusService: new DestinationUpdateStatusService(repository),
    findService: new DestinationFindService(repository),
    searchService: new DestinationSearchService(repository),
  };
}
