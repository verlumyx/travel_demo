import type { PaymentMethodRepository } from '../repositories/payment-method.repository';
import type { CreatePaymentMethodCommand } from '../commands/create-payment-method.command';
import type { PaymentMethodRow } from '../models/payment-method.model';

export class PaymentMethodCreateService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  async execute(command: CreatePaymentMethodCommand): Promise<PaymentMethodRow> {
    return this.repository.create(command);
  }
}
