import { CreatePaymentCommand } from '../commands/create-payment.command';
import { UpdatePaymentCommand } from '../commands/update-payment.command';
import { SearchPaymentCommand } from '../commands/search-payment.command';
import { PaymentRow } from '../models/payment.model';

export interface PaymentRepository {
  create(command: CreatePaymentCommand): Promise<PaymentRow>;
  findById(id: string): Promise<PaymentRow | null>;
  findOrFail(id: string): Promise<PaymentRow>;
  update(id: string, command: UpdatePaymentCommand): Promise<PaymentRow>;
  updateStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<PaymentRow>;
  search(command: SearchPaymentCommand): Promise<{ data: PaymentRow[], total: number }>;
}
