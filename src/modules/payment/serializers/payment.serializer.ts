import type { PaymentRow } from '../models/payment.model';
import type { PaymentWithDetailsRow } from '../repositories/payment.repository';

export interface PaymentDto {
  id: string;
  code: string;
  bookingId: string;
  method: 'pago_movil' | 'zelle' | 'binance' | 'zinli' | 'bank_transfer' | 'cash_usd' | 'cash_ves';
  amount: string;
  currency: string;
  reference: string | null;
  proofImageUrl: string | null;
  paymentDate: string;
  receivedByName: string | null;
  verifiedById: string | null;
  verifiedAt: string | null;
  notes: string | null;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string | null;
  // Optional joined details
  bookingCode?: string;
  bookingTotalAmount?: string;
  bookingPaidAmount?: string;
  bookingStatus?: string;
  customerName?: string;
  customerCode?: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  tourName?: string;
  tourCode?: string;
  departureDate?: string;
  departureCode?: string;
  verifiedByName?: string | null;
}

export function toPaymentDto(row: PaymentRow | PaymentWithDetailsRow): PaymentDto {
  const isDetailed = 'bookingCode' in row;

  return {
    id: row.id,
    code: row.code,
    bookingId: row.bookingId,
    method: row.method,
    amount: String(row.amount),
    currency: row.currency,
    reference: row.reference,
    proofImageUrl: row.proofImageUrl,
    paymentDate: row.paymentDate ? new Date(row.paymentDate).toISOString() : '',
    receivedByName: row.receivedByName,
    verifiedById: row.verifiedById,
    verifiedAt: row.verifiedAt ? new Date(row.verifiedAt).toISOString() : null,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    ...(isDetailed
      ? {
          bookingCode: (row as PaymentWithDetailsRow).bookingCode,
          bookingTotalAmount: (row as PaymentWithDetailsRow).bookingTotalAmount,
          bookingPaidAmount: (row as PaymentWithDetailsRow).bookingPaidAmount,
          bookingStatus: (row as PaymentWithDetailsRow).bookingStatus,
          customerName: (row as PaymentWithDetailsRow).customerName,
          customerCode: (row as PaymentWithDetailsRow).customerCode,
          customerPhone: (row as PaymentWithDetailsRow).customerPhone,
          customerEmail: (row as PaymentWithDetailsRow).customerEmail,
          tourName: (row as PaymentWithDetailsRow).tourName,
          tourCode: (row as PaymentWithDetailsRow).tourCode,
          departureDate: (row as PaymentWithDetailsRow).departureDate
            ? new Date((row as PaymentWithDetailsRow).departureDate).toISOString()
            : undefined,
          departureCode: (row as PaymentWithDetailsRow).departureCode,
          verifiedByName: (row as PaymentWithDetailsRow).verifiedByName,
        }
      : {}),
  };
}

