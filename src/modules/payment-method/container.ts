import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzlePaymentMethodRepository } from './repositories/drizzle-payment-method.repository';
import { PaymentMethodCreateService } from './services/payment-method-create.service';
import { PaymentMethodUpdateService } from './services/payment-method-update.service';
import { PaymentMethodUpdateStatusService } from './services/payment-method-update-status.service';
import { PaymentMethodFindService } from './services/payment-method-find.service';
import { PaymentMethodSearchService } from './services/payment-method-search.service';

export function createPaymentMethodContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzlePaymentMethodRepository(db);

  return {
    repository,
    createService: new PaymentMethodCreateService(repository),
    updateService: new PaymentMethodUpdateService(repository),
    updateStatusService: new PaymentMethodUpdateStatusService(repository),
    findService: new PaymentMethodFindService(repository),
    searchService: new PaymentMethodSearchService(repository),
  };
}
