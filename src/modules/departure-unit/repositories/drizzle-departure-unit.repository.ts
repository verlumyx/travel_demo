import { eq, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { departureUnits, type DepartureUnitRow, type NewDepartureUnitRow } from '../models/departure-unit.model';
import type { DepartureUnitRepository } from './departure-unit.repository';
import { DepartureUnitNotFoundException } from '../exceptions/departure-unit-not-found.exception';
import { departureUnitFilterMap } from './departure-unit.filters';

export class DrizzleDepartureUnitRepository implements DepartureUnitRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(data: Omit<NewDepartureUnitRow, 'id' | 'createdAt'>): Promise<DepartureUnitRow> {
    const [row] = await this.db.insert(departureUnits).values(data).returning();
    return row;
  }

  async findById(id: string): Promise<DepartureUnitRow | null> {
    const [row] = await this.db.select().from(departureUnits).where(eq(departureUnits.id, id));
    return row ?? null;
  }

  async findOrFail(id: string): Promise<DepartureUnitRow> {
    const row = await this.findById(id);
    if (!row) throw new DepartureUnitNotFoundException(id);
    return row;
  }

  async update(id: string, data: Partial<NewDepartureUnitRow>): Promise<DepartureUnitRow> {
    const [row] = await this.db.update(departureUnits).set(data).where(eq(departureUnits.id, id)).returning();
    if (!row) throw new DepartureUnitNotFoundException(id);
    return row;
  }

  async search(filters: { departureId?: string; transportUnitId?: string }, limit: number, offset: number): Promise<{ items: DepartureUnitRow[]; total: number }> {
    const whereClause = applyFilters(filters, departureUnitFilterMap);
    
    const [totalRow] = await this.db.select({ count: sql<number>`count(*)` }).from(departureUnits).where(whereClause);
    const total = Number(totalRow.count);
    
    const items = await this.db.select().from(departureUnits).where(whereClause).limit(limit).offset(offset);
    
    return { items, total };
  }
}
