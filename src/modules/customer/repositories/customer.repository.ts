import type { CreateCustomerCommand } from '../commands/create-customer.command';
import type { UpdateCustomerCommand } from '../commands/update-customer.command';
import type { SearchCustomerCommand } from '../commands/search-customer.command';
import type { CustomerRow } from '../models/customer.model';

export interface CustomerRepository {
  create(command: CreateCustomerCommand): Promise<CustomerRow>;
  findById(id: string): Promise<CustomerRow | null>;
  findOrFail(id: string): Promise<CustomerRow>;
  update(id: string, command: UpdateCustomerCommand): Promise<CustomerRow>;
  updateStatus(id: string, status: 'active' | 'inactive'): Promise<CustomerRow>;
  search(command: SearchCustomerCommand): Promise<{ data: CustomerRow[]; total: number }>;
  getActive(): Promise<CustomerRow[]>;
}
