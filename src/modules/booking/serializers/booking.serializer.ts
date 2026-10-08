import type { BookingRow } from '../models/booking.model';

export type BookingDto = {
  id: string;
  code: string;
  departureId: string;
  customerId: string;
  slotsReserved: number;
  totalAmount: string;
  paidAmount: string;
  pendingBalance: string;
  paymentProgressPercent: number;
  notes: string | null;
  source: 'admin' | 'portal';
  createdById: string | null;
  status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string | null;
  customerName?: string;
  customerCode?: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  departureDate?: string;
  departureCode?: string;
  tourName?: string;
  tourCode?: string;
};

export function toBookingDto(
  row: BookingRow & {
    customerName?: string;
    customerCode?: string;
    customerPhone?: string | null;
    customerEmail?: string | null;
    departureDate?: Date | string;
    departureCode?: string;
    tourName?: string;
    tourCode?: string;
  },
): BookingDto {
  const total = Number(row.totalAmount);
  const paid = Number(row.paidAmount);
  const pending = Math.max(0, total - paid).toFixed(2);
  const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return {
    id: row.id,
    code: row.code,
    departureId: row.departureId,
    customerId: row.customerId,
    slotsReserved: row.slotsReserved,
    totalAmount: String(row.totalAmount),
    paidAmount: String(row.paidAmount),
    pendingBalance: pending,
    paymentProgressPercent: percent,
    notes: row.notes,
    source: row.source,
    createdById: row.createdById,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    customerName: row.customerName,
    customerCode: row.customerCode,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    departureDate:
      row.departureDate instanceof Date
        ? row.departureDate.toISOString()
        : row.departureDate,
    departureCode: row.departureCode,
    tourName: row.tourName,
    tourCode: row.tourCode,
  };
}
