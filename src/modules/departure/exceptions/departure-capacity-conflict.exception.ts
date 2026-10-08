import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureCapacityConflictException extends DomainError {
  constructor(message: string) {
    super(message, 'DEPARTURE_CAPACITY_CONFLICT');
    this.name = 'DepartureCapacityConflictException';
  }
}
