import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class PaymentNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Payment with ID ${id} not found`, 'PAYMENT_NOT_FOUND', 404);
  }
}
