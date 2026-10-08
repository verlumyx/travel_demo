import { PaymentRepository } from '../repositories/payment.repository';

export class PaymentFindService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async findById(id: string) {
    return this.paymentRepository.findById(id);
  }

  async findOrFail(id: string) {
    return this.paymentRepository.findOrFail(id);
  }
}
