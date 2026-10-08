import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleDepartureUnitRepository } from './repositories/drizzle-departure-unit.repository';
import { DepartureUnitCreateService } from './services/departure-unit-create.service';
import { DepartureUnitUpdateService } from './services/departure-unit-update.service';
import { DepartureUnitFindService } from './services/departure-unit-find.service';
import { DepartureUnitSearchService } from './services/departure-unit-search.service';

export function createDepartureUnitContainer(db: DbExecutor) {
  const repository = new DrizzleDepartureUnitRepository(db);
  return {
    createService: new DepartureUnitCreateService(repository),
    updateService: new DepartureUnitUpdateService(repository),
    findService: new DepartureUnitFindService(repository),
    searchService: new DepartureUnitSearchService(repository),
  };
}
