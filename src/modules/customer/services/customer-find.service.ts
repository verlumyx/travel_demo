import { CustomerRepository } from '../repositories/customer.repository';

export class CustomerFindService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async findById(id: string) {
    return this.customerRepository.findById(id);
  }

  async findOrFail(id: string) {
    return this.customerRepository.findOrFail(id);
  }
}
