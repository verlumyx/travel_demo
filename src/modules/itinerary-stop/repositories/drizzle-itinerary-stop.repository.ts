import { eq, sql } from 'drizzle-orm';
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

  async search(filters: { tourId?: string; destinationId?: string }, limit: number, offset: number): Promise<{ items: ItineraryStopRow[]; total: number }> {
    const whereClause = applyFilters(filters, itineraryStopFilterMap);
    
    const [totalRow] = await this.db.select({ count: sql<number>`count(*)` }).from(itineraryStops).where(whereClause);
    const total = Number(totalRow.count);
    
    const items = await this.db.select().from(itineraryStops).where(whereClause).limit(limit).offset(offset);
    
    return { items, total };
  }
}
