import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleDepartureUnitRepository } from './repositories/drizzle-departure-unit.repository';
import { DrizzleDepartureRepository } from '@/modules/departure/repositories/drizzle-departure.repository';
import { DrizzleTransportUnitRepository } from '@/modules/transport-unit/repositories/drizzle-transport-unit.repository';
import { DepartureUnitCreateService } from './services/departure-unit-create.service';
import { DepartureUnitUpdateService } from './services/departure-unit-update.service';
import { DepartureUnitUnassignService } from './services/departure-unit-unassign.service';
import { DepartureUnitFindService } from './services/departure-unit-find.service';

export function createDepartureUnitContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleDepartureUnitRepository(db);
  const departureRepository = new DrizzleDepartureRepository(db);
  const transportUnitRepository = new DrizzleTransportUnitRepository(db);

  return {
    repository,
    createService: new DepartureUnitCreateService(
      repository,
      departureRepository,
      transportUnitRepository,
    ),
    updateService: new DepartureUnitUpdateService(
      repository,
      departureRepository,
    ),
    unassignService: new DepartureUnitUnassignService(
      repository,
      departureRepository,
    ),
    findService: new DepartureUnitFindService(repository),
  };
}
