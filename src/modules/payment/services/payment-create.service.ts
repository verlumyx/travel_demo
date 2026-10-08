import { PaymentRepository } from '../repositories/payment.repository';
import { CreatePaymentCommand } from '../commands/create-payment.command';

export class PaymentCreateService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: CreatePaymentCommand) {
    return this.paymentRepository.create(command);
  }
}
