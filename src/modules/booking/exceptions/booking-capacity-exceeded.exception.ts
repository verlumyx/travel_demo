import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class BookingCapacityExceededException extends DomainError {
  constructor(
    message = 'No hay cupos suficientes disponibles para esta salida programada.',
  ) {
    super(message, 'BOOKING_CAPACITY_EXCEEDED', 400);
    this.name = 'BookingCapacityExceededException';
  }
}
