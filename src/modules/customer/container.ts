import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleCustomerRepository } from './repositories/drizzle-customer.repository';
import { CustomerCreateService } from './services/customer-create.service';
import { CustomerUpdateService } from './services/customer-update.service';
import { CustomerUpdateStatusService } from './services/customer-update-status.service';
import { CustomerFindService } from './services/customer-find.service';
import { CustomerSearchService } from './services/customer-search.service';

export function createCustomerContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleCustomerRepository(db);
  return {
    repository,
    createService: new CustomerCreateService(repository),
    updateService: new CustomerUpdateService(repository),
    updateStatusService: new CustomerUpdateStatusService(repository),
    findService: new CustomerFindService(repository),
    searchService: new CustomerSearchService(repository),
  };
}
