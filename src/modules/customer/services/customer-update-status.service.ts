import { CustomerRepository } from '../repositories/customer.repository';
import { UpdateStatusCustomerCommand } from '../commands/update-status-customer.command';

export class CustomerUpdateStatusService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: UpdateStatusCustomerCommand) {
    return this.customerRepository.updateStatus(command.id, command.status);
  }
}
