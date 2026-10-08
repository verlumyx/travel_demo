import { and, count, eq, isNull, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  departureUnits,
  type DepartureUnitRow,
  type NewDepartureUnitRow,
} from '../models/departure-unit.model';
import { transportUnits } from '@/modules/transport-unit/models/transport-unit.model';
import type {
  DepartureUnitRepository,
  DepartureUnitWithDetailsRow,
} from './departure-unit.repository';
import { DepartureUnitNotFoundException } from '../exceptions/departure-unit-not-found.exception';
import { departureUnitFilterMap } from './departure-unit.filters';

export class DrizzleDepartureUnitRepository implements DepartureUnitRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(
    data: Omit<NewDepartureUnitRow, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<DepartureUnitRow> {
    const [row] = await this.db
      .insert(departureUnits)
      .values({
        ...data,
      })
      .returning();
    return row;
  }

  async findById(id: string): Promise<DepartureUnitRow | null> {
    const [row] = await this.db
      .select()
      .from(departureUnits)
      .where(and(eq(departureUnits.id, id), isNull(departureUnits.deletedAt)))
      .limit(1);
    return row ?? null;
  }

  async findOrFail(id: string): Promise<DepartureUnitRow> {
    const row = await this.findById(id);
    if (!row) throw new DepartureUnitNotFoundException(id);
    return row;
  }

  async update(
    id: string,
    data: Partial<NewDepartureUnitRow>,
  ): Promise<DepartureUnitRow> {
    const [row] = await this.db
      .update(departureUnits)
      .set(data)
      .where(and(eq(departureUnits.id, id), isNull(departureUnits.deletedAt)))
      .returning();
    if (!row) throw new DepartureUnitNotFoundException(id);
    return row;
  }

  async softDelete(id: string): Promise<void> {
    const [row] = await this.db
      .update(departureUnits)
      .set({ deletedAt: new Date() })
      .where(and(eq(departureUnits.id, id), isNull(departureUnits.deletedAt)))
      .returning();
    if (!row) throw new DepartureUnitNotFoundException(id);
  }

  async findByDepartureId(
    departureId: string,
  ): Promise<DepartureUnitWithDetailsRow[]> {
    const rows = await this.db
      .select({
        id: departureUnits.id,
        departureId: departureUnits.departureId,
        transportUnitId: departureUnits.transportUnitId,
        assignedCapacity: departureUnits.assignedCapacity,
        driverNameOverride: departureUnits.driverNameOverride,
        driverPhoneOverride: departureUnits.driverPhoneOverride,
        notes: departureUnits.notes,
        createdAt: departureUnits.createdAt,
        deletedAt: departureUnits.deletedAt,
        unitCode: transportUnits.code,
        unitName: transportUnits.name,
        unitType: transportUnits.type,
        unitPlateNumber: transportUnits.plateNumber,
        unitTotalCapacity: transportUnits.capacity,
        unitDefaultDriver: transportUnits.driverName,
        unitDefaultPhone: transportUnits.driverPhone,
      })
      .from(departureUnits)
      .innerJoin(
        transportUnits,
        eq(departureUnits.transportUnitId, transportUnits.id),
      )
      .where(
        and(
          eq(departureUnits.departureId, departureId),
          isNull(departureUnits.deletedAt),
        ),
      )
      .orderBy(transportUnits.name);

    return rows;
  }

  async findByDepartureAndUnit(
    departureId: string,
    transportUnitId: string,
  ): Promise<DepartureUnitRow | null> {
    const [row] = await this.db
      .select()
      .from(departureUnits)
      .where(
        and(
          eq(departureUnits.departureId, departureId),
          eq(departureUnits.transportUnitId, transportUnitId),
          isNull(departureUnits.deletedAt),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  async calculateTotalCapacityForDeparture(departureId: string): Promise<number> {
    const [result] = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${departureUnits.assignedCapacity}), 0)::int`,
      })
      .from(departureUnits)
      .where(
        and(
          eq(departureUnits.departureId, departureId),
          isNull(departureUnits.deletedAt),
        ),
      );

    return Number(result?.total ?? 0);
  }

  async search(
    filters: { departureId?: string; transportUnitId?: string },
    limit: number,
    offset: number,
  ): Promise<{ items: DepartureUnitRow[]; total: number }> {
    const conditions = applyFilters(departureUnitFilterMap, filters);
    const where = and(isNull(departureUnits.deletedAt), ...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(departureUnits)
      .where(where);

    const items = await this.db
      .select()
      .from(departureUnits)
      .where(where)
      .limit(limit)
      .offset(offset);

    return { items, total: Number(total) };
  }
}
