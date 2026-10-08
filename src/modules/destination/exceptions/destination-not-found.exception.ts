import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DestinationNotFoundException extends DomainError {
  constructor(id: string) {
    super('Destination not found', 'DESTINATION_NOT_FOUND', { id });
  }
}
