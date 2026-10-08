import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { BookingRepository } from './booking.repository';
import { CreateBookingCommand } from '../commands/create-booking.command';
import { UpdateBookingCommand } from '../commands/update-booking.command';
import { SearchBookingCommand } from '../commands/search-booking.command';
import { BookingRow, bookings, BOOKING_CODE_PREFIX, BOOKING_CODE_WIDTH } from '../models/booking.model';
import { BookingNotFoundException } from '../exceptions/booking-not-found.exception';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { bookingFilters } from './booking.filters';
import { eq, sql } from 'drizzle-orm';

export class DrizzleBookingRepository implements BookingRepository {
  constructor(private readonly db: DbExecutor) {}

  private async generateNextCode(tx: any): Promise<string> {
    const result = await tx.execute(
      sql`SELECT code FROM app_bookings WHERE code LIKE ${BOOKING_CODE_PREFIX || '%'} ORDER BY id DESC LIMIT 1 FOR UPDATE`
    );
    const lastCode = result.rows[0]?.code as string | undefined;
    let nextNumber = 1;
    if (lastCode) {
      const match = lastCode.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }
    return `${BOOKING_CODE_PREFIX}${String(nextNumber).padStart(BOOKING_CODE_WIDTH, '0')}`;
  }

  async create(command: CreateBookingCommand): Promise<BookingRow> {
    return await this.db.transaction(async (tx) => {
      const code = await this.generateNextCode(tx);
      const [row] = await tx.insert(bookings).values({
        id: command.id,
        code,
        departureId: command.departureId,
        customerId: command.customerId,
        slotsReserved: command.slotsReserved,
        totalAmount: command.totalAmount,
        paidAmount: command.paidAmount,
        notes: command.notes,
        source: command.source,
        createdById: command.createdById
      }).returning();
      return row;
    });
  }

  async findById(id: string): Promise<BookingRow | null> {
    const rows = await this.db.select().from(bookings).where(eq(bookings.id, id));
    return rows[0] || null;
  }

  async findOrFail(id: string): Promise<BookingRow> {
    const row = await this.findById(id);
    if (!row) throw new BookingNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateBookingCommand): Promise<BookingRow> {
    const [row] = await this.db.update(bookings).set({
      departureId: command.departureId,
      customerId: command.customerId,
      slotsReserved: command.slotsReserved,
      totalAmount: command.totalAmount,
      paidAmount: command.paidAmount,
      notes: command.notes,
      source: command.source
    }).where(eq(bookings.id, id)).returning();
    if (!row) throw new BookingNotFoundException(id);
    return row;
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled'): Promise<BookingRow> {
    const [row] = await this.db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    if (!row) throw new BookingNotFoundException(id);
    return row;
  }

  async search(command: SearchBookingCommand): Promise<{ data: BookingRow[], total: number }> {
    const query = this.db.select().from(bookings).$dynamic();
    applyFilters(query, command.filters, bookingFilters);
    const countQuery = this.db.select({ count: sql<number>`count(*)` }).from(bookings).$dynamic();
    applyFilters(countQuery, command.filters, bookingFilters);
    
    const [data, [{ count }]] = await Promise.all([
      query.limit(command.limit).offset(command.offset),
      countQuery
    ]);
    
    return { data, total: Number(count) };
  }
}
