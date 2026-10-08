import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzlePaymentRepository } from './repositories/drizzle-payment.repository';
import { PaymentCreateService } from './services/payment-create.service';
import { PaymentUpdateService } from './services/payment-update.service';
import { PaymentUpdateStatusService } from './services/payment-update-status.service';
import { PaymentFindService } from './services/payment-find.service';
import { PaymentSearchService } from './services/payment-search.service';

export function createPaymentContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzlePaymentRepository(db);
  return {
    repository,
    createService: new PaymentCreateService(repository),
    updateService: new PaymentUpdateService(repository),
    updateStatusService: new PaymentUpdateStatusService(repository),
    findService: new PaymentFindService(repository),
    searchService: new PaymentSearchService(repository),
  };
}
