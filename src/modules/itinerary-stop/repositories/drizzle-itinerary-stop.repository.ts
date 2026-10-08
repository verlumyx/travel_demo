import { and, desc, eq, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { itineraryStops, type ItineraryStopRow, type NewItineraryStopRow } from '../models/itinerary-stop.model';
import type { ItineraryStopRepository } from './itinerary-stop.repository';
import { ItineraryStopNotFoundException } from '../exceptions/itinerary-stop-not-found.exception';
import { itineraryStopFilterMap } from './itinerary-stop.filters';

export class DrizzleItineraryStopRepository implements ItineraryStopRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(data: Omit<NewItineraryStopRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItineraryStopRow> {
    const [row] = await this.db.insert(itineraryStops).values(data).returning();
    return row;
  }

  async findById(id: string): Promise<ItineraryStopRow | null> {
    const [row] = await this.db.select().from(itineraryStops).where(eq(itineraryStops.id, id));
    return row ?? null;
  }

  async findOrFail(id: string): Promise<ItineraryStopRow> {
    const row = await this.findById(id);
    if (!row) throw new ItineraryStopNotFoundException(id);
    return row;
  }

  async update(id: string, data: Partial<NewItineraryStopRow>): Promise<ItineraryStopRow> {
    const [row] = await this.db.update(itineraryStops).set(data).where(eq(itineraryStops.id, id)).returning();
    if (!row) throw new ItineraryStopNotFoundException(id);
    return row;
  }

  async search(
    filters: { tourId?: string; destinationId?: string },
    limit: number,
    offset: number,
  ): Promise<{ items: ItineraryStopRow[]; total: number }> {
    const conditions = applyFilters(itineraryStopFilterMap, filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(itineraryStops)
      .where(where);

    const items = await this.db
      .select()
      .from(itineraryStops)
      .where(where)
      .limit(limit)
      .offset(offset);

    return { items, total: Number(total) };
  }

  async findByTourId(tourId: string): Promise<ItineraryStopRow[]> {
    return this.db
      .select()
      .from(itineraryStops)
      .where(eq(itineraryStops.tourId, tourId))
      .orderBy(itineraryStops.dayNumber, itineraryStops.sortOrder);
  }
}
