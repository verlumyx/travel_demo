import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Departure with id ${id} not found`, 'DEPARTURE_NOT_FOUND', 404);
  }
}
