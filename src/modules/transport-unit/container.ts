import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleTransportUnitRepository } from './repositories/drizzle-transport-unit.repository';
import { TransportUnitCreateService } from './services/transport-unit-create.service';
import { TransportUnitUpdateService } from './services/transport-unit-update.service';
import { TransportUnitUpdateStatusService } from './services/transport-unit-update-status.service';
import { TransportUnitFindService } from './services/transport-unit-find.service';
import { TransportUnitSearchService } from './services/transport-unit-search.service';

import { db as defaultDb } from '@/db/client';

export function createTransportUnitContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleTransportUnitRepository(db);
  return {
    repository,
    createService: new TransportUnitCreateService(repository),
    updateService: new TransportUnitUpdateService(repository),
    updateStatusService: new TransportUnitUpdateStatusService(repository),
    findService: new TransportUnitFindService(repository),
    searchService: new TransportUnitSearchService(repository),
  };
}
