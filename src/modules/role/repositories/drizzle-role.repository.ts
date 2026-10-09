import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_roles, type RoleRow } from '../models/role.model';

import type { RoleRepository } from './role.repository';
import { RoleNotFoundException } from '../exceptions/role-not-found.exception';
import { roleFilters } from './role.filters';
import type { CreateRoleCommand } from '../commands/create-role.command';
import type { UpdateRoleCommand } from '../commands/update-role.command';
import type { SearchRoleCommand } from '../commands/search-role.command';
import { eq, count, sql } from 'drizzle-orm';

export class DrizzleRoleRepository implements RoleRepository {
  constructor(private readonly db: DbExecutor) {}
  

  async create(command: CreateRoleCommand) {
    return this.db.transaction(async (tx) => {
      
      const dataToInsert = { ...command };
    
      const [row] = await tx.insert(app_roles).values(dataToInsert).returning();
      return row;
    });
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(app_roles).where(eq(app_roles.id, id));
    return row || null;
  }

  async findOrFail(id: string) {
    const row = await this.findById(id);
    if (!row) throw new RoleNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateRoleCommand) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.update(app_roles)
      .set(command)
      .where(eq(app_roles.id, id))
      .returning();
    return row;
  }

  async updateStatus(id: string, status: any) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.update(app_roles)
      .set({ status })
      .where(eq(app_roles.id, id))
      .returning();
    return row;
  }

  async search(command: SearchRoleCommand) {
    const conditions = applyFilters(command, roleFilters);
    const query = this.db.select().from(app_roles);
    if (conditions.length > 0) {
      query.where(conditions[0]);
    }
    const limit = command.limit || 20;
    const offset = command.offset || 0;
    query.limit(limit).offset(offset);

    const rows = await query;
    const [{ count: totalRows }] = await this.db.select({ count: count() }).from(app_roles);
    return { data: rows, total: Number(totalRows) };
  }

  async getAll(): Promise<RoleRow[]> {
    return this.db.select().from(app_roles).orderBy(app_roles.createdAt);
  }
}
