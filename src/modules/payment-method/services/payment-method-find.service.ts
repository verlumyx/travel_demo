import type { PaymentMethodRepository } from '../repositories/payment-method.repository';
import type { PaymentMethodRow } from '../models/payment-method.model';

export class PaymentMethodFindService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  async execute(id: string): Promise<PaymentMethodRow> {
    return this.repository.findOrFail(id);
  }
}
