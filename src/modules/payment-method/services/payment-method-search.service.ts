import type { PaymentMethodRepository } from '../repositories/payment-method.repository';
import type { SearchPaymentMethodCommand } from '../commands/search-payment-method.command';
import type { PaymentMethodRow } from '../models/payment-method.model';

export class PaymentMethodSearchService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  async execute(command: SearchPaymentMethodCommand): Promise<{ data: PaymentMethodRow[]; total: number }> {
    return this.repository.search(command);
  }
}
