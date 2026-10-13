import { and, count, desc, eq, like } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import type {
  BookingRepository,
  BookingWithDetailsRow,
  BookingFullDetails,
} from './booking.repository';
import type { CreateBookingCommand } from '../commands/create-booking.command';
import type { UpdateBookingCommand } from '../commands/update-booking.command';
import type { SearchBookingCommand } from '../commands/search-booking.command';
import {
  bookings,
  BOOKING_CODE_PREFIX,
  BOOKING_CODE_WIDTH,
  type BookingRow,
} from '../models/booking.model';
import { customers } from '@/modules/customer/models/customer.model';
import { departures } from '@/modules/departure/models/departure.model';
import { tours } from '@/modules/tour/models/tour.model';
import { passengers } from '@/modules/passenger/models/passenger.model';
import { payments } from '@/modules/payment/models/payment.model';
import { BookingNotFoundException } from '../exceptions/booking-not-found.exception';
import { BookingCapacityExceededException } from '../exceptions/booking-capacity-exceeded.exception';
import { DomainError } from '@/modules/shared/exceptions/domain-error';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { bookingFilters } from './booking.filters';

export class DrizzleBookingRepository implements BookingRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreateBookingCommand): Promise<BookingRow> {
    // 1. Lock and verify departure capacity
    const [departure] = await this.db
      .select()
      .from(departures)
      .where(eq(departures.id, command.departureId))
      .for('update');

    if (!departure) {
      throw new DomainError('La salida programada especificada no existe.');
    }

    if (departure.status === 'completed' || departure.status === 'cancelled') {
      throw new DomainError(
        'No se pueden crear reservas en una salida completada o cancelada.',
      );
    }

    const availableSlots = departure.totalCapacity - departure.bookedSlots;
    if (departure.bookedSlots + command.slotsReserved > departure.totalCapacity) {
      throw new BookingCapacityExceededException(
        `No hay suficientes cupos disponibles en esta salida. Disponibles: ${availableSlots}, Solicitados: ${command.slotsReserved}.`,
      );
    }

    // 2. Generate atomic code
    const code = await this.generateNextCode();

    // 3. Insert booking
    const [row] = await this.db
      .insert(bookings)
      .values({
        id: command.id,
        code,
        departureId: command.departureId,
        customerId: command.customerId,
        slotsReserved: command.slotsReserved,
        totalAmount: command.totalAmount,
        paidAmount: command.paidAmount ?? '0',
        notes: command.notes,
        source: command.source,
        createdById: command.createdById,
        status: 'pending',
      })
      .returning();

    // 4. Insert passengers if provided
    if (command.passengers.length > 0) {
      await this.db.insert(passengers).values(
        command.passengers.map((p) => ({
          bookingId: row.id,
          firstName: p.firstName,
          lastName: p.lastName,
          documentType: p.documentType,
          documentNumber: p.documentNumber,
          phone: p.phone,
          isMainContact: p.isMainContact ?? false,
          notes: p.notes,
        })),
      );
    }

    // 5. Update departure bookedSlots
    await this.db
      .update(departures)
      .set({
        bookedSlots: departure.bookedSlots + command.slotsReserved,
        updatedAt: new Date(),
      })
      .where(eq(departures.id, departure.id));

    return row;
  }

  async findById(id: string): Promise<BookingRow | null> {
    const [row] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<BookingRow> {
    const row = await this.findById(id);
    if (!row) throw new BookingNotFoundException(id);
    return row;
  }

  async findWithDetails(id: string): Promise<BookingFullDetails | null> {
    const [header] = await this.db
      .select({
        booking: bookings,
        customer: customers,
        departure: departures,
        tour: tours,
      })
      .from(bookings)
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!header) return null;

    const [bookingPassengers, bookingPayments] = await Promise.all([
      this.db
        .select()
        .from(passengers)
        .where(eq(passengers.bookingId, id))
        .orderBy(desc(passengers.isMainContact), passengers.firstName),
      this.db
        .select()
        .from(payments)
        .where(eq(payments.bookingId, id))
        .orderBy(desc(payments.paymentDate)),
    ]);

    return {
      booking: header.booking,
      customer: header.customer,
      departure: header.departure,
      tour: header.tour,
      passengers: bookingPassengers,
      payments: bookingPayments,
    };
  }

  async findOrFailWithDetails(id: string): Promise<BookingFullDetails> {
    const result = await this.findWithDetails(id);
    if (!result) throw new BookingNotFoundException(id);
    return result;
  }

  async update(id: string, command: UpdateBookingCommand): Promise<BookingRow> {
    const [row] = await this.db
      .update(bookings)
      .set({
        notes: command.notes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    if (!row) throw new BookingNotFoundException(id);
    return row;
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled',
  ): Promise<BookingRow> {
    if (status === 'cancelled') {
      return this.cancel(id);
    }

    const [row] = await this.db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    if (!row) throw new BookingNotFoundException(id);
    return row;
  }

  async cancel(id: string): Promise<BookingRow> {
    const [booking] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .for('update');

    if (!booking) throw new BookingNotFoundException(id);
    if (booking.status === 'cancelled') return booking;

    // Release slots in departure
    const [departure] = await this.db
      .select()
      .from(departures)
      .where(eq(departures.id, booking.departureId))
      .for('update');

    if (departure) {
      const newBookedSlots = Math.max(
        0,
        departure.bookedSlots - booking.slotsReserved,
      );
      await this.db
        .update(departures)
        .set({ bookedSlots: newBookedSlots, updatedAt: new Date() })
        .where(eq(departures.id, departure.id));
    }

    const [row] = await this.db
      .update(bookings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    return row;
  }

  async search(
    command: SearchBookingCommand,
  ): Promise<{ data: BookingWithDetailsRow[]; total: number }> {
    const conditions = applyFilters(bookingFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(bookings)
      .where(where);

    const rows = await this.db
      .select({
        booking: bookings,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerCode: customers.code,
        customerPhone: customers.phone,
        customerEmail: customers.email,
        departureDate: departures.departureDate,
        departureCode: departures.code,
        tourName: tours.name,
        tourCode: tours.code,
      })
      .from(bookings)
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .where(where)
      .orderBy(desc(bookings.code))
      .limit(command.limit)
      .offset(command.offset);

    const data: BookingWithDetailsRow[] = rows.map((r) => ({
      ...r.booking,
      customerName: `${r.customerFirstName} ${r.customerLastName}`.trim(),
      customerCode: r.customerCode,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      departureDate: r.departureDate,
      departureCode: r.departureCode,
      tourName: r.tourName,
      tourCode: r.tourCode,
    }));

    return { data, total: Number(total) };
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(bookings.code, `${BOOKING_CODE_PREFIX}%`);

    await this.db
      .select({ id: bookings.id })
      .from(bookings)
      .where(scope)
      .orderBy(desc(bookings.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: bookings.code })
      .from(bookings)
      .where(scope)
      .orderBy(desc(bookings.code))
      .limit(1);

    const next = last
      ? Number(last.code.slice(BOOKING_CODE_PREFIX.length)) + 1
      : 1;

    return `${BOOKING_CODE_PREFIX}${String(next).padStart(
      BOOKING_CODE_WIDTH,
      '0',
    )}`;
  }
}
