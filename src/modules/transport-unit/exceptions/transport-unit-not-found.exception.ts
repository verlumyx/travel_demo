import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class TransportUnitNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Transport unit with id ${id} not found`, 'TRANSPORT_UNIT_NOT_FOUND', 404);
  }
}
