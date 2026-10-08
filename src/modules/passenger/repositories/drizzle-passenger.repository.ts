import { and, count, desc, eq, ne } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import type {
  PassengerRepository,
  ManifestPassengerRow,
} from './passenger.repository';
import type { CreatePassengerCommand } from '../commands/create-passenger.command';
import type { UpdatePassengerCommand } from '../commands/update-passenger.command';
import type { SearchPassengerCommand } from '../commands/search-passenger.command';
import { PassengerRow, passengers } from '../models/passenger.model';
import { bookings } from '@/modules/booking/models/booking.model';
import { customers } from '@/modules/customer/models/customer.model';
import { PassengerNotFoundException } from '../exceptions/passenger-not-found.exception';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { passengerFilters } from './passenger.filters';

export class DrizzlePassengerRepository implements PassengerRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreatePassengerCommand): Promise<PassengerRow> {
    const [row] = await this.db
      .insert(passengers)
      .values({
        bookingId: command.bookingId,
        firstName: command.firstName,
        lastName: command.lastName,
        documentType: command.documentType,
        documentNumber: command.documentNumber,
        phone: command.phone,
        isMainContact: command.isMainContact,
        notes: command.notes,
      })
      .returning();
    return row;
  }

  async createMany(
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
  ): Promise<PassengerRow[]> {
    if (items.length === 0) return [];
    return this.db.insert(passengers).values(items).returning();
  }

  async findById(id: string): Promise<PassengerRow | null> {
    const [row] = await this.db
      .select()
      .from(passengers)
      .where(eq(passengers.id, id))
      .limit(1);
    return row ?? null;
  }

  async findOrFail(id: string): Promise<PassengerRow> {
    const row = await this.findById(id);
    if (!row) throw new PassengerNotFoundException(id);
    return row;
  }

  async findByBookingId(bookingId: string): Promise<PassengerRow[]> {
    return this.db
      .select()
      .from(passengers)
      .where(eq(passengers.bookingId, bookingId))
      .orderBy(desc(passengers.isMainContact), passengers.firstName);
  }

  async findManifestByDepartureId(
    departureId: string,
  ): Promise<ManifestPassengerRow[]> {
    const rows = await this.db
      .select({
        id: passengers.id,
        firstName: passengers.firstName,
        lastName: passengers.lastName,
        documentType: passengers.documentType,
        documentNumber: passengers.documentNumber,
        phone: passengers.phone,
        isMainContact: passengers.isMainContact,
        notes: passengers.notes,
        bookingId: bookings.id,
        bookingCode: bookings.code,
        bookingStatus: bookings.status,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmergencyContact: customers.emergencyContact,
        customerEmergencyPhone: customers.emergencyPhone,
      })
      .from(passengers)
      .innerJoin(bookings, eq(passengers.bookingId, bookings.id))
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .where(
        and(
          eq(bookings.departureId, departureId),
          ne(bookings.status, 'cancelled'),
        ),
      )
      .orderBy(passengers.lastName, passengers.firstName);

    return rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      documentType: r.documentType,
      documentNumber: r.documentNumber,
      phone: r.phone,
      isMainContact: r.isMainContact,
      notes: r.notes,
      bookingId: r.bookingId,
      bookingCode: r.bookingCode,
      bookingStatus: r.bookingStatus,
      customerName: `${r.customerFirstName} ${r.customerLastName}`.trim(),
      customerEmergencyContact: r.customerEmergencyContact,
      customerEmergencyPhone: r.customerEmergencyPhone,
    }));
  }

  async update(
    id: string,
    command: UpdatePassengerCommand,
  ): Promise<PassengerRow> {
    const [row] = await this.db
      .update(passengers)
      .set({
        firstName: command.firstName,
        lastName: command.lastName,
        documentType: command.documentType,
        documentNumber: command.documentNumber,
        phone: command.phone,
        isMainContact: command.isMainContact,
        notes: command.notes,
      })
      .where(eq(passengers.id, id))
      .returning();

    if (!row) throw new PassengerNotFoundException(id);
    return row;
  }

  async search(
    command: SearchPassengerCommand,
  ): Promise<{ data: PassengerRow[]; total: number }> {
    const conditions = applyFilters(passengerFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(passengers)
      .where(where);

    const data = await this.db
      .select()
      .from(passengers)
      .where(where)
      .limit(command.limit)
      .offset(command.offset);

    return { data, total: Number(total) };
  }
}
