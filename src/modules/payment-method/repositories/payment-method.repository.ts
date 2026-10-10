import type { PaymentMethodRow } from '../models/payment-method.model';
import type { CreatePaymentMethodCommand } from '../commands/create-payment-method.command';
import type { UpdatePaymentMethodCommand } from '../commands/update-payment-method.command';
import type { UpdateStatusPaymentMethodCommand } from '../commands/update-status-payment-method.command';
import type { SearchPaymentMethodCommand } from '../commands/search-payment-method.command';

export interface PaymentMethodRepository {
  create(command: CreatePaymentMethodCommand): Promise<PaymentMethodRow>;
  findById(id: string): Promise<PaymentMethodRow | null>;
  findOrFail(id: string): Promise<PaymentMethodRow>;
  update(id: string, command: UpdatePaymentMethodCommand): Promise<PaymentMethodRow>;
  updateStatus(id: string, command: UpdateStatusPaymentMethodCommand): Promise<PaymentMethodRow>;
  search(command: SearchPaymentMethodCommand): Promise<{ data: PaymentMethodRow[]; total: number }>;
  getActive(): Promise<PaymentMethodRow[]>;
}
