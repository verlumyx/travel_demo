import type { CreatePassengerCommand } from '../commands/create-passenger.command';
import type { UpdatePassengerCommand } from '../commands/update-passenger.command';
import type { SearchPassengerCommand } from '../commands/search-passenger.command';
import type { PassengerRow } from '../models/passenger.model';

export type ManifestPassengerRow = {
  id: string;
  firstName: string;
  lastName: string;
  documentType: 'cedula' | 'passport' | 'other' | null;
  documentNumber: string | null;
  phone: string | null;
  isMainContact: boolean;
  notes: string | null;
  bookingId: string;
  bookingCode: string;
  bookingStatus: string;
  customerName: string;
  customerEmergencyContact: string | null;
  customerEmergencyPhone: string | null;
};

export interface PassengerRepository {
  create(command: CreatePassengerCommand): Promise<PassengerRow>;
  createMany(
    items: {
      bookingId: string;
      firstName: string;
      lastName: string;
      documentType?: 'cedula' | 'passport' | 'other' | null;
      documentNumber?: string | null;
      phone?: string | null;
      isMainContact?: boolean;
      notes?: string | null;
    }[],
  ): Promise<PassengerRow[]>;
  findById(id: string): Promise<PassengerRow | null>;
  findOrFail(id: string): Promise<PassengerRow>;
  findByBookingId(bookingId: string): Promise<PassengerRow[]>;
  findManifestByDepartureId(departureId: string): Promise<ManifestPassengerRow[]>;
  update(id: string, command: UpdatePassengerCommand): Promise<PassengerRow>;
  search(command: SearchPassengerCommand): Promise<{ data: PassengerRow[]; total: number }>;
}
