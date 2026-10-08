import { BookingRow } from '../models/booking.model';

export function toBookingDto(row: BookingRow) {
  return {
    id: row.id,
    code: row.code,
    departureId: row.departureId,
    customerId: row.customerId,
    slotsReserved: row.slotsReserved,
    totalAmount: String(row.totalAmount),
    paidAmount: String(row.paidAmount),
    notes: row.notes,
    source: row.source,
    createdById: row.createdById,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString()
  };
}
