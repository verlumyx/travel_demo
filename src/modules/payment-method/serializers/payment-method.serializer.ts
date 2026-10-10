import type { PaymentMethodRow } from '../models/payment-method.model';

export type PaymentMethodDto = {
  id: string;
  code: string;
  name: string;
  currency: string;
  instructions: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string | null;
};

export function toPaymentMethodDto(row: PaymentMethodRow): PaymentMethodDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    currency: row.currency,
    instructions: row.instructions,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
