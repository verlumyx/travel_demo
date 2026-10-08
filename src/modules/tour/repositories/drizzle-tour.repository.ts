import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { app_tours } from '../models/tour.model';
import { TOUR_CODE_PREFIX, TOUR_CODE_WIDTH } from '../models/tour.model';
import type { TourRepository } from './tour.repository';
import { TourNotFoundException } from '../exceptions/tour-not-found.exception';
import { tourFilters } from './tour.filters';
import type { CreateTourCommand } from '../commands/create-tour.command';
import type { UpdateTourCommand } from '../commands/update-tour.command';
import type { SearchTourCommand } from '../commands/search-tour.command';
import { eq, count, sql } from 'drizzle-orm';

export class DrizzleTourRepository implements TourRepository {
  constructor(private readonly db: DbExecutor) {}
  
  private async generateNextCode(tx: any): Promise<string> {
    const result = await tx.execute(
      `SELECT code FROM app_tours WHERE code LIKE '${ TOUR_CODE_PREFIX }%' ORDER BY code DESC LIMIT 1 FOR UPDATE`
    );
    let nextNumber = 1;
    if (result.rows.length > 0) {
      const lastCode = result.rows[0].code as string;
      const lastNumber = parseInt(lastCode.replace(TOUR_CODE_PREFIX, ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    return `${ TOUR_CODE_PREFIX }${String(nextNumber).padStart(TOUR_CODE_WIDTH, '0')}`;
  }
    

  async create(command: CreateTourCommand) {
    return this.db.transaction(async (tx) => {
      
      const code = await this.generateNextCode(tx);
      const dataToInsert = { ...command, code };
    
      const [row] = await tx.insert(app_tours).values(dataToInsert).returning();
      return row;
    });
  }

  async findById(id: string) {
    const [row] = await this.db.db.select().from(app_tours).where(eq(app_tours.id, id));
    return row || null;
  }

  async findOrFail(id: string) {
    const row = await this.findById(id);
    if (!row) throw new TourNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateTourCommand) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.db.update(app_tours)
      .set(command)
      .where(eq(app_tours.id, id))
      .returning();
    return row;
  }

  async updateStatus(id: string, status: string) {
    await this.findOrFail(id); // verify exists
    const [row] = await this.db.db.update(app_tours)
      .set({ status })
      .where(eq(app_tours.id, id))
      .returning();
    return row;
  }

  async search(command: SearchTourCommand) {
    const conditions = applyFilters(command, tourFilters);
    const query = this.db.db.select().from(app_tours);
    if (conditions.length > 0) {
      query.where(conditions[0]);
    }
    const limit = command.limit || 20;
    const offset = command.offset || 0;
    query.limit(limit).offset(offset);

    const rows = await query;
    const [{ count: totalRows }] = await this.db.db.select({ count: count() }).from(app_tours);
    return { data: rows, total: Number(totalRows) };
  }
}
