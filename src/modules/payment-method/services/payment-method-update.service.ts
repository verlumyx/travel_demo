import type { PaymentMethodRepository } from '../repositories/payment-method.repository';
import type { UpdatePaymentMethodCommand } from '../commands/update-payment-method.command';
import type { PaymentMethodRow } from '../models/payment-method.model';

export class PaymentMethodUpdateService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  async execute(id: string, command: UpdatePaymentMethodCommand): Promise<PaymentMethodRow> {
    return this.repository.update(id, command);
  }
}
