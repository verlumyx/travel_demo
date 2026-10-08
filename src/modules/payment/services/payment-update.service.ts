import { PaymentRepository } from '../repositories/payment.repository';
import { UpdatePaymentCommand } from '../commands/update-payment.command';

export class PaymentUpdateService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: UpdatePaymentCommand) {
    return this.paymentRepository.update(command.id, command);
  }
}
