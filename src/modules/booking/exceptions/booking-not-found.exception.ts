import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class BookingNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Booking with ID ${id} not found`, 'BOOKING_NOT_FOUND', 404);
  }
}
