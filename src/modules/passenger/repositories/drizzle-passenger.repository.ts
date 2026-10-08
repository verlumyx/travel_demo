import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { PassengerRepository } from './passenger.repository';
import { CreatePassengerCommand } from '../commands/create-passenger.command';
import { UpdatePassengerCommand } from '../commands/update-passenger.command';
import { SearchPassengerCommand } from '../commands/search-passenger.command';
import { PassengerRow, passengers } from '../models/passenger.model';
import { PassengerNotFoundException } from '../exceptions/passenger-not-found.exception';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { passengerFilters } from './passenger.filters';
import { eq, sql } from 'drizzle-orm';

export class DrizzlePassengerRepository implements PassengerRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreatePassengerCommand): Promise<PassengerRow> {
    const [row] = await this.db.insert(passengers).values({
      bookingId: command.bookingId,
      firstName: command.firstName,
      lastName: command.lastName,
      documentType: command.documentType,
      documentNumber: command.documentNumber,
      phone: command.phone,
      isMainContact: command.isMainContact,
      notes: command.notes
    }).returning();
    return row;
  }

  async findById(id: string): Promise<PassengerRow | null> {
    const rows = await this.db.select().from(passengers).where(eq(passengers.id, id));
    return rows[0] || null;
  }

  async findOrFail(id: string): Promise<PassengerRow> {
    const row = await this.findById(id);
    if (!row) throw new PassengerNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdatePassengerCommand): Promise<PassengerRow> {
    const [row] = await this.db.update(passengers).set({
      firstName: command.firstName,
      lastName: command.lastName,
      documentType: command.documentType,
      documentNumber: command.documentNumber,
      phone: command.phone,
      isMainContact: command.isMainContact,
      notes: command.notes
    }).where(eq(passengers.id, id)).returning();
    if (!row) throw new PassengerNotFoundException(id);
    return row;
  }

  async search(command: SearchPassengerCommand): Promise<{ data: PassengerRow[], total: number }> {
    const query = this.db.select().from(passengers).$dynamic();
    applyFilters(query, command.filters, passengerFilters);
    const countQuery = this.db.select({ count: sql<number>`count(*)` }).from(passengers).$dynamic();
    applyFilters(countQuery, command.filters, passengerFilters);
    
    const [data, [{ count }]] = await Promise.all([
      query.limit(command.limit).offset(command.offset),
      countQuery
    ]);
    
    return { data, total: Number(count) };
  }
}
