import { CustomerRow } from '../models/customer.model';

export function toCustomerDto(row: CustomerRow) {
  return {
    id: row.id,
    code: row.code,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    birthDate: row.birthDate?.toISOString(),
    emergencyContact: row.emergencyContact,
    emergencyPhone: row.emergencyPhone,
    notes: row.notes,
    source: row.source,
    supabaseUserId: row.supabaseUserId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString()
  };
}
