import { and, desc, eq, ilike, or, sql, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import type { SystemLogRepository } from './system-log.repository';
import type { SystemLogFilters } from './system-log.filters';
import { systemLogs, type SystemLogRow, type NewSystemLogRow } from '../models/system-log.model';

export class DrizzleSystemLogRepository implements SystemLogRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(data: NewSystemLogRow): Promise<SystemLogRow> {
    const [row] = await this.db
      .insert(systemLogs)
      .values({
        id: data.id || crypto.randomUUID(),
        level: data.level,
        source: data.source,
        message: data.message,
        errorName: data.errorName,
        stack: data.stack,
        path: data.path,
        action: data.action,
        context: data.context,
        ip: data.ip,
        userAgent: data.userAgent,
        status: data.status || 'unread',
        createdAt: data.createdAt || new Date(),
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<SystemLogRow | null> {
    const [row] = await this.db
      .select()
      .from(systemLogs)
      .where(eq(systemLogs.id, id))
      .limit(1);

    return row || null;
  }

  async search(filters: SystemLogFilters): Promise<{ items: SystemLogRow[]; total: number }> {
    const conditions = [];

    if (filters.level) {
      conditions.push(eq(systemLogs.level, filters.level));
    }

    if (filters.source && filters.source !== 'all') {
      conditions.push(eq(systemLogs.source, filters.source));
    }

    if (filters.status && (filters.status as string) !== 'all') {
      conditions.push(eq(systemLogs.status, filters.status as 'unread' | 'investigating' | 'resolved'));
    }


    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(systemLogs.message, term),
          ilike(systemLogs.errorName, term),
          ilike(systemLogs.path, term),
          ilike(systemLogs.action, term),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await this.db
      .select({ count: count() })
      .from(systemLogs)
      .where(whereClause);

    const total = Number(totalRes?.count || 0);

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const items = await this.db
      .select()
      .from(systemLogs)
      .where(whereClause)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total };
  }

  async updateStatus(
    id: string,
    status: 'unread' | 'investigating' | 'resolved',
  ): Promise<SystemLogRow> {
    const [updated] = await this.db
      .update(systemLogs)
      .set({ status })
      .where(eq(systemLogs.id, id))
      .returning();

    return updated;
  }

  async clearResolved(): Promise<number> {
    const result = await this.db
      .delete(systemLogs)
      .where(eq(systemLogs.status, 'resolved'))
      .returning();

    return result.length;
  }
}
