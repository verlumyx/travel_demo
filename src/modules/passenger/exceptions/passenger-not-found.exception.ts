import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class PassengerNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Passenger with ID ${id} not found`, 'PASSENGER_NOT_FOUND', 404);
  }
}
