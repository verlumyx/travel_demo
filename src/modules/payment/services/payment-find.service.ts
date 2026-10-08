import { PaymentRepository } from '../repositories/payment.repository';

export class PaymentFindService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async findById(id: string) {
    return this.paymentRepository.findById(id);
  }

  async findOrFail(id: string) {
    return this.paymentRepository.findOrFail(id);
  }

  async findWithDetails(id: string) {
    return this.paymentRepository.findWithDetails(id);
  }

  async findOrFailWithDetails(id: string) {
    return this.paymentRepository.findOrFailWithDetails(id);
  }
}
