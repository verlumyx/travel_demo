import { eq, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { transportUnits, TRANSPORT_UNIT_CODE_PREFIX, TRANSPORT_UNIT_CODE_WIDTH, type TransportUnitRow, type NewTransportUnitRow } from '../models/transport-unit.model';
import type { TransportUnitRepository } from './transport-unit.repository';
import { TransportUnitNotFoundException } from '../exceptions/transport-unit-not-found.exception';
import { transportUnitFilterMap } from './transport-unit.filters';

export class DrizzleTransportUnitRepository implements TransportUnitRepository {
  constructor(private readonly db: DbExecutor) {}

  private async generateNextCode(): Promise<string> {
    const [{ nextval }] = await this.db.execute<{ nextval: number }>(sql`SELECT nextval('app_transport_units_code_seq')`);
    return `${TRANSPORT_UNIT_CODE_PREFIX}${String(nextval).padStart(TRANSPORT_UNIT_CODE_WIDTH, '0')}`;
  }

  async create(data: Omit<NewTransportUnitRow, 'code' | 'status' | 'createdAt' | 'updatedAt'>): Promise<TransportUnitRow> {
    // Note: Assuming a sequence exists or code generation logic is handled differently.
    // We can also just count or use a sequence.
    return this.db.transaction(async (tx) => {
      // Create sequence if not exists logic ideally should be in migrations.
      const [{ max_code }] = await tx.execute<{ max_code: string | null }>(
        sql`SELECT MAX(code) as max_code FROM app_transport_units FOR UPDATE`
      );
      
      let nextNum = 1;
      if (max_code && max_code.startsWith(TRANSPORT_UNIT_CODE_PREFIX)) {
        nextNum = parseInt(max_code.replace(TRANSPORT_UNIT_CODE_PREFIX, ''), 10) + 1;
      }
      const code = `${TRANSPORT_UNIT_CODE_PREFIX}${String(nextNum).padStart(TRANSPORT_UNIT_CODE_WIDTH, '0')}`;
      
      const [row] = await tx.insert(transportUnits).values({ ...data, code }).returning();
      return row;
    });
  }

  async findById(id: string): Promise<TransportUnitRow | null> {
    const [row] = await this.db.select().from(transportUnits).where(eq(transportUnits.id, id));
    return row ?? null;
  }

  async findOrFail(id: string): Promise<TransportUnitRow> {
    const row = await this.findById(id);
    if (!row) throw new TransportUnitNotFoundException(id);
    return row;
  }

  async update(id: string, data: Partial<NewTransportUnitRow>): Promise<TransportUnitRow> {
    const [row] = await this.db.update(transportUnits).set(data).where(eq(transportUnits.id, id)).returning();
    if (!row) throw new TransportUnitNotFoundException(id);
    return row;
  }

  async updateStatus(id: string, status: TransportUnitRow['status']): Promise<TransportUnitRow> {
    return this.update(id, { status });
  }

  async search(filters: { q?: string; status?: string; type?: string }, limit: number, offset: number): Promise<{ items: TransportUnitRow[]; total: number }> {
    const whereClause = applyFilters(filters, transportUnitFilterMap);
    
    const [totalRow] = await this.db.select({ count: sql<number>`count(*)` }).from(transportUnits).where(whereClause);
    const total = Number(totalRow.count);
    
    const items = await this.db.select().from(transportUnits).where(whereClause).limit(limit).offset(offset);
    
    return { items, total };
  }
}
