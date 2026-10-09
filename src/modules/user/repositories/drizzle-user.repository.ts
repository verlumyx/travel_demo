import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_users } from '../models/user.model';

import type { UserRepository, UserWithRoleRow } from './user.repository';
import { app_roles } from '@/modules/role/models/role.model';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { userFilters } from './user.filters';
import type { CreateUserCommand } from '../commands/create-user.command';
import type { UpdateUserCommand } from '../commands/update-user.command';
import type { SearchUserCommand } from '../commands/search-user.command';
import { eq, count, sql } from 'drizzle-orm';

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: DbExecutor) {}
  

  async create(command: CreateUserCommand) {
    return this.db.transaction(async (tx) => {
      
      const dataToInsert = { ...command };
    
      const [row] = await tx.insert(app_users).values(dataToInsert).returning();
      return row;
    });
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(app_users).where(eq(app_users.id, id));
    return row || null;
  }

  async findOrFail(id: string) {
    const row = await this.findById(id);
    if (!row) throw new UserNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateUserCommand) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.update(app_users)
      .set(command)
      .where(eq(app_users.id, id))
      .returning();
    return row;
  }

  async updateStatus(id: string, status: any) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.update(app_users)
      .set({ status })
      .where(eq(app_users.id, id))
      .returning();
    return row;
  }

  async search(command: SearchUserCommand) {
    const conditions = applyFilters(command, userFilters);
    const query = this.db.select().from(app_users);
    if (conditions.length > 0) {
      query.where(conditions[0]);
    }
    const limit = command.limit || 20;
    const offset = command.offset || 0;
    query.limit(limit).offset(offset);

    const rows = await query;
    const [{ count: totalRows }] = await this.db.select({ count: count() }).from(app_users);
    return { data: rows, total: Number(totalRows) };
  }

  async getAllWithRole(): Promise<UserWithRoleRow[]> {
    return this.db
      .select({
        id: app_users.id,
        name: app_users.name,
        email: app_users.email,
        phone: app_users.phone,
        status: app_users.status,
        createdAt: app_users.createdAt,
        lastLoginAt: app_users.lastLoginAt,
        roleName: app_roles.name,
        rolePermissionType: app_roles.permissionType,
      })
      .from(app_users)
      .innerJoin(app_roles, eq(app_users.roleId, app_roles.id))
      .orderBy(app_users.createdAt);
  }
}
