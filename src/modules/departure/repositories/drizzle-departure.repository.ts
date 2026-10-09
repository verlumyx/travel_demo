import { and, count, desc, eq, like, ne } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  departures,
  DEPARTURE_CODE_PREFIX,
  DEPARTURE_CODE_WIDTH,
  type DepartureRow,
} from '../models/departure.model';
import { tours, type TourRow } from '@/modules/tour/models/tour.model';
import type {
  DepartureRepository,
  DepartureWithTourRow,
  DepartureForBookingOption,
} from './departure.repository';
import type { CreateDepartureCommand } from '../commands/create-departure.command';
import type { UpdateDepartureCommand } from '../commands/update-departure.command';
import type { SearchDepartureCommand } from '../commands/search-departure.command';
import { DepartureNotFoundException } from '../exceptions/departure-not-found.exception';
import { departureFilterMap } from './departure.filters';

export class DrizzleDepartureRepository implements DepartureRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreateDepartureCommand): Promise<DepartureRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(departures)
      .values({
        id: command.id,
        code,
        tourId: command.tourId,
        departureDate: command.departureDate,
        returnDate: command.returnDate,
        meetingPoint: command.meetingPoint,
        meetingTime: command.meetingTime,
        priceOverride: command.priceOverride,
        totalCapacity: command.totalCapacity,
        bookedSlots: 0,
        notes: command.notes,
        status: 'scheduled',
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<DepartureRow | null> {
    const [row] = await this.db
      .select()
      .from(departures)
      .where(eq(departures.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<DepartureRow> {
    const row = await this.findById(id);
    if (!row) throw new DepartureNotFoundException(id);
    return row;
  }

  async findByIdWithTour(
    id: string,
  ): Promise<{ departure: DepartureRow; tour: TourRow } | null> {
    const [row] = await this.db
      .select({
        departure: departures,
        tour: tours,
      })
      .from(departures)
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .where(eq(departures.id, id))
      .limit(1);

    if (!row) return null;
    return {
      departure: row.departure,
      tour: row.tour,
    };
  }

  async findOrFailWithTour(
    id: string,
  ): Promise<{ departure: DepartureRow; tour: TourRow }> {
    const result = await this.findByIdWithTour(id);
    if (!result) throw new DepartureNotFoundException(id);
    return result;
  }

  async update(id: string, command: UpdateDepartureCommand): Promise<DepartureRow> {
    const [row] = await this.db
      .update(departures)
      .set({
        tourId: command.tourId,
        departureDate: command.departureDate,
        returnDate: command.returnDate,
        meetingPoint: command.meetingPoint,
        meetingTime: command.meetingTime,
        priceOverride: command.priceOverride,
        notes: command.notes,
        updatedAt: new Date(),
      })
      .where(eq(departures.id, id))
      .returning();

    if (!row) throw new DepartureNotFoundException(id);
    return row;
  }

  async updateStatus(
    id: string,
    status: DepartureRow['status'],
  ): Promise<DepartureRow> {
    const [row] = await this.db
      .update(departures)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(departures.id, id))
      .returning();

    if (!row) throw new DepartureNotFoundException(id);
    return row;
  }

  async updateCapacity(
    id: string,
    totalCapacity: number,
  ): Promise<DepartureRow> {
    const [row] = await this.db
      .update(departures)
      .set({
        totalCapacity,
        updatedAt: new Date(),
      })
      .where(eq(departures.id, id))
      .returning();

    if (!row) throw new DepartureNotFoundException(id);
    return row;
  }

  async search(
    command: SearchDepartureCommand,
  ): Promise<{ data: DepartureWithTourRow[]; total: number }> {
    const conditions = applyFilters(departureFilterMap, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(departures)
      .where(where);

    const rows = await this.db
      .select({
        departure: departures,
        tourName: tours.name,
        tourCode: tours.code,
      })
      .from(departures)
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .where(where)
      .orderBy(desc(departures.departureDate))
      .limit(command.limit)
      .offset(command.offset);

    const data: DepartureWithTourRow[] = rows.map((r) => ({
      ...r.departure,
      tourName: r.tourName,
      tourCode: r.tourCode,
    }));

    return { data, total: Number(total) };
  }

  async findByTourId(tourId: string): Promise<DepartureRow[]> {
    return this.db
      .select()
      .from(departures)
      .where(eq(departures.tourId, tourId))
      .orderBy(desc(departures.departureDate));
  }

  async getActiveScheduled(): Promise<DepartureForBookingOption[]> {
    return this.db
      .select({
        id: departures.id,
        code: departures.code,
        departureDate: departures.departureDate,
        totalCapacity: departures.totalCapacity,
        bookedSlots: departures.bookedSlots,
        priceOverride: departures.priceOverride,
        tourName: tours.name,
        tourCode: tours.code,
        tourBasePrice: tours.basePrice,
      })
      .from(departures)
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .where(
        and(
          ne(departures.status, 'completed'),
          ne(departures.status, 'cancelled'),
        ),
      )
      .orderBy(desc(departures.departureDate));
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(departures.code, `${DEPARTURE_CODE_PREFIX}%`);

    // Pessimistic lock on the last row for concurrency safety
    await this.db
      .select({ id: departures.id })
      .from(departures)
      .where(scope)
      .orderBy(desc(departures.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: departures.code })
      .from(departures)
      .where(scope)
      .orderBy(desc(departures.code))
      .limit(1);

    const next = last
      ? Number(last.code.slice(DEPARTURE_CODE_PREFIX.length)) + 1
      : 1;

    return `${DEPARTURE_CODE_PREFIX}${String(next).padStart(
      DEPARTURE_CODE_WIDTH,
      '0',
    )}`;
  }
}
