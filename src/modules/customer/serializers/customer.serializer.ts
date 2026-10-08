import type { CustomerRow } from '../models/customer.model';

export type CustomerDto = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  documentType: 'cedula' | 'passport' | 'other' | null;
  documentNumber: string | null;
  birthDate: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  notes: string | null;
  source: 'admin' | 'portal' | 'whatsapp' | 'instagram';
  supabaseUserId: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string | null;
};

export function toCustomerDto(row: CustomerRow): CustomerDto {
  return {
    id: row.id,
    code: row.code,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email,
    phone: row.phone,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    birthDate: row.birthDate?.toISOString() ?? null,
    emergencyContact: row.emergencyContact,
    emergencyPhone: row.emergencyPhone,
    notes: row.notes,
    source: row.source,
    supabaseUserId: row.supabaseUserId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
