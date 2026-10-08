import { PaymentRow } from '../models/payment.model';

export function toPaymentDto(row: PaymentRow) {
  return {
    id: row.id,
    code: row.code,
    bookingId: row.bookingId,
    method: row.method,
    amount: String(row.amount),
    currency: row.currency,
    reference: row.reference,
    proofImageUrl: row.proofImageUrl,
    paymentDate: row.paymentDate.toISOString(),
    receivedByName: row.receivedByName,
    verifiedById: row.verifiedById,
    verifiedAt: row.verifiedAt?.toISOString(),
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString()
  };
}
