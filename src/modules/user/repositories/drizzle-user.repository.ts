import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_users } from '../models/user.model';

import type { UserRepository } from './user.repository';
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
    const [row] = await this.db.db.select().from(app_users).where(eq(app_users.id, id));
    return row || null;
  }

  async findOrFail(id: string) {
    const row = await this.findById(id);
    if (!row) throw new UserNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateUserCommand) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.db.update(app_users)
      .set(command)
      .where(eq(app_users.id, id))
      .returning();
    return row;
  }

  async updateStatus(id: string, status: string) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.db.update(app_users)
      .set({ status })
      .where(eq(app_users.id, id))
      .returning();
    return row;
  }

  async search(command: SearchUserCommand) {
    const conditions = applyFilters(command, userFilters);
    const query = this.db.db.select().from(app_users);
    if (conditions.length > 0) {
      query.where(conditions[0]);
    }
    const limit = command.limit || 20;
    const offset = command.offset || 0;
    query.limit(limit).offset(offset);

    const rows = await query;
    const [{ count: totalRows }] = await this.db.db.select({ count: count() }).from(app_users);
    return { data: rows, total: Number(totalRows) };
  }
}
