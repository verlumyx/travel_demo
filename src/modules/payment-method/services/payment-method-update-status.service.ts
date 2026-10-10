import type { PaymentMethodRepository } from '../repositories/payment-method.repository';
import type { UpdateStatusPaymentMethodCommand } from '../commands/update-status-payment-method.command';
import type { PaymentMethodRow } from '../models/payment-method.model';

export class PaymentMethodUpdateStatusService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  async execute(id: string, command: UpdateStatusPaymentMethodCommand): Promise<PaymentMethodRow> {
    return this.repository.updateStatus(id, command);
  }
}
