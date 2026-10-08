import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureUnitNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Departure unit with id ${id} not found`, 'DEPARTURE_UNIT_NOT_FOUND', 404);
  }
}
