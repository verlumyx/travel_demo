import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleBookingRepository } from './repositories/drizzle-booking.repository';
import { BookingCreateService } from './services/booking-create.service';
import { BookingUpdateService } from './services/booking-update.service';
import { BookingUpdateStatusService } from './services/booking-update-status.service';
import { BookingFindService } from './services/booking-find.service';
import { BookingSearchService } from './services/booking-search.service';

export function createBookingContainer(db: DbExecutor) {
  const repository = new DrizzleBookingRepository(db);
  return {
    createService: new BookingCreateService(repository),
    updateService: new BookingUpdateService(repository),
    updateStatusService: new BookingUpdateStatusService(repository),
    findService: new BookingFindService(repository),
    searchService: new BookingSearchService(repository)
  };
}
