import { and, desc, eq, like, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  app_destinations,
  DESTINATION_CODE_PREFIX,
  DESTINATION_CODE_WIDTH,
  type DestinationRow,
} from '../models/destination.model';
import type { DestinationRepository } from './destination.repository';
import { DestinationNotFoundException } from '../exceptions/destination-not-found.exception';
import { destinationFilters } from './destination.filters';
import type { CreateDestinationCommand } from '../commands/create-destination.command';
import type { UpdateDestinationCommand } from '../commands/update-destination.command';
import type { SearchDestinationCommand } from '../commands/search-destination.command';

export class DrizzleDestinationRepository implements DestinationRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreateDestinationCommand): Promise<DestinationRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(app_destinations)
      .values({
        id: command.id,
        code,
        categoryId: command.categoryId,
        name: command.name,
        slug: command.slug,
        description: command.description,
        imageUrl: command.imageUrl,
        state: command.state,
        city: command.city,
        country: command.country,
        status: 'active',
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<DestinationRow | null> {
    const [row] = await this.db
      .select()
      .from(app_destinations)
      .where(eq(app_destinations.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<DestinationRow> {
    const row = await this.findById(id);
    if (!row) throw new DestinationNotFoundException(id);
    return row;
  }

  async findBySlug(slug: string): Promise<DestinationRow | null> {
    const [row] = await this.db
      .select()
      .from(app_destinations)
      .where(eq(app_destinations.slug, slug))
      .limit(1);

    return row ?? null;
  }

  async update(id: string, command: UpdateDestinationCommand): Promise<DestinationRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_destinations)
      .set({
        categoryId: command.categoryId,
        name: command.name,
        slug: command.slug,
        description: command.description,
        imageUrl: command.imageUrl,
        state: command.state,
        city: command.city,
        country: command.country,
      })
      .where(eq(app_destinations.id, id))
      .returning();

    return row;
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<DestinationRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_destinations)
      .set({ status })
      .where(eq(app_destinations.id, id))
      .returning();

    return row;
  }

  async search(command: SearchDestinationCommand): Promise<{ data: DestinationRow[]; total: number }> {
    const conditions = applyFilters(destinationFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(app_destinations)
      .where(where);

    const data = await this.db
      .select()
      .from(app_destinations)
      .where(where)
      .orderBy(desc(app_destinations.createdAt))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total: Number(total) };
  }

  async getActive(): Promise<DestinationRow[]> {
    return this.db
      .select()
      .from(app_destinations)
      .where(eq(app_destinations.status, 'active'))
      .orderBy(app_destinations.name);
  }

  async findByCategoryId(categoryId: string): Promise<DestinationRow[]> {
    return this.db
      .select()
      .from(app_destinations)
      .where(eq(app_destinations.categoryId, categoryId))
      .orderBy(app_destinations.name);
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(app_destinations.code, `${DESTINATION_CODE_PREFIX}%`);

    await this.db
      .select({ id: app_destinations.id })
      .from(app_destinations)
      .where(scope)
      .orderBy(desc(app_destinations.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: app_destinations.code })
      .from(app_destinations)
      .where(scope)
      .orderBy(desc(app_destinations.code))
      .limit(1);

    const next = last ? Number(last.code.slice(DESTINATION_CODE_PREFIX.length)) + 1 : 1;
    return `${DESTINATION_CODE_PREFIX}${String(next).padStart(DESTINATION_CODE_WIDTH, '0')}`;
  }
}
