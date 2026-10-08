import { PassengerRow } from '../models/passenger.model';

export function toPassengerDto(row: PassengerRow) {
  return {
    id: row.id,
    bookingId: row.bookingId,
    firstName: row.firstName,
    lastName: row.lastName,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    phone: row.phone,
    isMainContact: row.isMainContact,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString()
  };
}
