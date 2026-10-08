import { PaymentRepository } from '../repositories/payment.repository';
import { UpdateStatusPaymentCommand } from '../commands/update-status-payment.command';

export class PaymentUpdateStatusService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: UpdateStatusPaymentCommand) {
    return this.paymentRepository.updateStatus(command.id, command.status);
  }
}
