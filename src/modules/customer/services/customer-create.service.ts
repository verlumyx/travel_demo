import { CustomerRepository } from '../repositories/customer.repository';
import { CreateCustomerCommand } from '../commands/create-customer.command';

export class CustomerCreateService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: CreateCustomerCommand) {
    return this.customerRepository.create(command);
  }
}
