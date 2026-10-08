import { eq, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { departures, DEPARTURE_CODE_PREFIX, DEPARTURE_CODE_WIDTH, type DepartureRow, type NewDepartureRow } from '../models/departure.model';
import type { DepartureRepository } from './departure.repository';
import { DepartureNotFoundException } from '../exceptions/departure-not-found.exception';
import { departureFilterMap } from './departure.filters';

export class DrizzleDepartureRepository implements DepartureRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(data: Omit<NewDepartureRow, 'code' | 'status' | 'bookedSlots' | 'createdAt' | 'updatedAt'>): Promise<DepartureRow> {
    return this.db.transaction(async (tx) => {
      const [{ max_code }] = await tx.execute<{ max_code: string | null }>(
        sql`SELECT MAX(code) as max_code FROM app_departures FOR UPDATE`
      );
      
      let nextNum = 1;
      if (max_code && max_code.startsWith(DEPARTURE_CODE_PREFIX)) {
        nextNum = parseInt(max_code.replace(DEPARTURE_CODE_PREFIX, ''), 10) + 1;
      }
      const code = `${DEPARTURE_CODE_PREFIX}${String(nextNum).padStart(DEPARTURE_CODE_WIDTH, '0')}`;
      
      const [row] = await tx.insert(departures).values({ ...data, code }).returning();
      return row;
    });
  }

  async findById(id: string): Promise<DepartureRow | null> {
    const [row] = await this.db.select().from(departures).where(eq(departures.id, id));
    return row ?? null;
  }

  async findOrFail(id: string): Promise<DepartureRow> {
    const row = await this.findById(id);
    if (!row) throw new DepartureNotFoundException(id);
    return row;
  }

  async update(id: string, data: Partial<NewDepartureRow>): Promise<DepartureRow> {
    const [row] = await this.db.update(departures).set(data).where(eq(departures.id, id)).returning();
    if (!row) throw new DepartureNotFoundException(id);
    return row;
  }

  async updateStatus(id: string, status: DepartureRow['status']): Promise<DepartureRow> {
    return this.update(id, { status });
  }

  async search(filters: { q?: string; status?: string; tourId?: string }, limit: number, offset: number): Promise<{ items: DepartureRow[]; total: number }> {
    const whereClause = applyFilters(filters, departureFilterMap);
    
    const [totalRow] = await this.db.select({ count: sql<number>`count(*)` }).from(departures).where(whereClause);
    const total = Number(totalRow.count);
    
    const items = await this.db.select().from(departures).where(whereClause).limit(limit).offset(offset);
    
    return { items, total };
  }
}
