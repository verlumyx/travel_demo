import { and, desc, eq, like, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  transportUnits,
  TRANSPORT_UNIT_CODE_PREFIX,
  TRANSPORT_UNIT_CODE_WIDTH,
  type TransportUnitRow,
  type NewTransportUnitRow,
} from '../models/transport-unit.model';
import type { TransportUnitRepository } from './transport-unit.repository';
import { TransportUnitNotFoundException } from '../exceptions/transport-unit-not-found.exception';
import { transportUnitFilterMap } from './transport-unit.filters';

export class DrizzleTransportUnitRepository implements TransportUnitRepository {
  constructor(private readonly db: DbExecutor) {}

  private async generateNextCode(): Promise<string> {
    const scope = like(transportUnits.code, `${TRANSPORT_UNIT_CODE_PREFIX}%`);

    await this.db
      .select({ id: transportUnits.id })
      .from(transportUnits)
      .where(scope)
      .orderBy(desc(transportUnits.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: transportUnits.code })
      .from(transportUnits)
      .where(scope)
      .orderBy(desc(transportUnits.code))
      .limit(1);

    const next = last ? Number(last.code.slice(TRANSPORT_UNIT_CODE_PREFIX.length)) + 1 : 1;
    return `${TRANSPORT_UNIT_CODE_PREFIX}${String(next).padStart(TRANSPORT_UNIT_CODE_WIDTH, '0')}`;
  }

  async create(data: Omit<NewTransportUnitRow, 'code' | 'status' | 'createdAt' | 'updatedAt'>): Promise<TransportUnitRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(transportUnits)
      .values({
        ...data,
        code,
        status: 'active',
      })
      .returning();

    return row;
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
    await this.findOrFail(id);

    const [row] = await this.db
      .update(transportUnits)
      .set(data)
      .where(eq(transportUnits.id, id))
      .returning();

    return row;
  }

  async updateStatus(id: string, status: TransportUnitRow['status']): Promise<TransportUnitRow> {
    return this.update(id, { status });
  }

  async search(
    filters: { q?: string; status?: string; type?: string },
    limit: number,
    offset: number,
  ): Promise<{ items: TransportUnitRow[]; total: number }> {
    const conditions = applyFilters(transportUnitFilterMap, filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(transportUnits)
      .where(where);

    const items = await this.db
      .select()
      .from(transportUnits)
      .where(where)
      .orderBy(desc(transportUnits.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total: Number(total) };
  }

  async getActive(): Promise<TransportUnitRow[]> {
    return this.db
      .select()
      .from(transportUnits)
      .where(eq(transportUnits.status, 'active'))
      .orderBy(transportUnits.name);
  }
}
