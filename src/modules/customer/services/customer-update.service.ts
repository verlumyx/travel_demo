import { CustomerRepository } from '../repositories/customer.repository';
import { UpdateCustomerCommand } from '../commands/update-customer.command';

export class CustomerUpdateService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: UpdateCustomerCommand) {
    return this.customerRepository.update(command.id, command);
  }
}
