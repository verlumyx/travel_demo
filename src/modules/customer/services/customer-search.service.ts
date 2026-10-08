import { CustomerRepository } from '../repositories/customer.repository';
import { SearchCustomerCommand } from '../commands/search-customer.command';

export class CustomerSearchService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: SearchCustomerCommand) {
    return this.customerRepository.search(command);
  }
}
