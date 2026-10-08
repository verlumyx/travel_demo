import { PaymentRepository } from '../repositories/payment.repository';
import { SearchPaymentCommand } from '../commands/search-payment.command';

export class PaymentSearchService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: SearchPaymentCommand) {
    return this.paymentRepository.search(command);
  }
}
