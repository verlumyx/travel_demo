import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_destinations } from '../models/destination.model';
import { DESTINATION_CODE_PREFIX, DESTINATION_CODE_WIDTH } from '../models/destination.model';
import type { DestinationRepository } from './destination.repository';
import { DestinationNotFoundException } from '../exceptions/destination-not-found.exception';
import { destinationFilters } from './destination.filters';
import type { CreateDestinationCommand } from '../commands/create-destination.command';
import type { UpdateDestinationCommand } from '../commands/update-destination.command';
import type { SearchDestinationCommand } from '../commands/search-destination.command';
import { eq, count, sql } from 'drizzle-orm';

export class DrizzleDestinationRepository implements DestinationRepository {
  constructor(private readonly db: DbExecutor) {}
  
  private async generateNextCode(tx: any): Promise<string> {
    const result = await tx.execute(
      `SELECT code FROM app_destinations WHERE code LIKE '${ DESTINATION_CODE_PREFIX }%' ORDER BY code DESC LIMIT 1 FOR UPDATE`
    );
    let nextNumber = 1;
    if (result.rows.length > 0) {
      const lastCode = result.rows[0].code as string;
      const lastNumber = parseInt(lastCode.replace(DESTINATION_CODE_PREFIX, ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    return `${ DESTINATION_CODE_PREFIX }${String(nextNumber).padStart(DESTINATION_CODE_WIDTH, '0')}`;
  }
    

  async create(command: CreateDestinationCommand) {
    return this.db.transaction(async (tx) => {
      
      const code = await this.generateNextCode(tx);
      const dataToInsert = { ...command, code };
    
      const [row] = await tx.insert(app_destinations).values(dataToInsert).returning();
      return row;
    });
  }

  async findById(id: string) {
    const [row] = await this.db.db.select().from(app_destinations).where(eq(app_destinations.id, id));
    return row || null;
  }

  async findOrFail(id: string) {
    const row = await this.findById(id);
    if (!row) throw new DestinationNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateDestinationCommand) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.db.update(app_destinations)
      .set(command)
      .where(eq(app_destinations.id, id))
      .returning();
    return row;
  }

  async updateStatus(id: string, status: string) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.db.update(app_destinations)
      .set({ status })
      .where(eq(app_destinations.id, id))
      .returning();
    return row;
  }

  async search(command: SearchDestinationCommand) {
    const conditions = applyFilters(command, destinationFilters);
    const query = this.db.db.select().from(app_destinations);
    if (conditions.length > 0) {
      query.where(conditions[0]);
    }
    const limit = command.limit || 20;
    const offset = command.offset || 0;
    query.limit(limit).offset(offset);

    const rows = await query;
    const [{ count: totalRows }] = await this.db.db.select({ count: count() }).from(app_destinations);
    return { data: rows, total: Number(totalRows) };
  }
}
