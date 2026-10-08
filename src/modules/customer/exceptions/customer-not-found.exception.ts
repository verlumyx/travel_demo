import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class CustomerNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Customer with ID ${id} not found`, 'CUSTOMER_NOT_FOUND', 404);
  }
}
