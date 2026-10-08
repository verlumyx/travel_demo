import { and, desc, eq, like, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  app_tours,
  TOUR_CODE_PREFIX,
  TOUR_CODE_WIDTH,
  type TourRow,
} from '../models/tour.model';
import type { TourRepository } from './tour.repository';
import { TourNotFoundException } from '../exceptions/tour-not-found.exception';
import { tourFilters } from './tour.filters';
import type { CreateTourCommand } from '../commands/create-tour.command';
import type { UpdateTourCommand } from '../commands/update-tour.command';
import type { SearchTourCommand } from '../commands/search-tour.command';

export class DrizzleTourRepository implements TourRepository {
  constructor(private readonly db: DbExecutor) {}

  private async generateNextCode(): Promise<string> {
    const scope = like(app_tours.code, `${TOUR_CODE_PREFIX}%`);

    await this.db
      .select({ id: app_tours.id })
      .from(app_tours)
      .where(scope)
      .orderBy(desc(app_tours.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: app_tours.code })
      .from(app_tours)
      .where(scope)
      .orderBy(desc(app_tours.code))
      .limit(1);

    const next = last ? Number(last.code.slice(TOUR_CODE_PREFIX.length)) + 1 : 1;
    return `${TOUR_CODE_PREFIX}${String(next).padStart(TOUR_CODE_WIDTH, '0')}`;
  }

  async create(command: CreateTourCommand): Promise<TourRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(app_tours)
      .values({
        id: command.id,
        code,
        name: command.name,
        slug: command.slug,
        description: command.description,
        shortDescription: command.shortDescription,
        imageUrl: command.imageUrl,
        durationDays: command.durationDays,
        basePrice: command.basePrice,
        currency: command.currency,
        includesFood: command.includesFood,
        includesLodging: command.includesLodging,
        inclusions: command.inclusions,
        exclusions: command.exclusions,
        status: command.status || 'draft',
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<TourRow | null> {
    const [row] = await this.db
      .select()
      .from(app_tours)
      .where(eq(app_tours.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<TourRow> {
    const row = await this.findById(id);
    if (!row) throw new TourNotFoundException(id);
    return row;
  }

  async findBySlug(slug: string): Promise<TourRow | null> {
    const [row] = await this.db
      .select()
      .from(app_tours)
      .where(eq(app_tours.slug, slug))
      .limit(1);

    return row ?? null;
  }

  async update(id: string, command: UpdateTourCommand): Promise<TourRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_tours)
      .set({
        name: command.name,
        slug: command.slug,
        description: command.description,
        shortDescription: command.shortDescription,
        imageUrl: command.imageUrl,
        durationDays: command.durationDays,
        basePrice: command.basePrice,
        currency: command.currency,
        includesFood: command.includesFood,
        includesLodging: command.includesLodging,
        inclusions: command.inclusions,
        exclusions: command.exclusions,
        status: command.status,
      })
      .where(eq(app_tours.id, id))
      .returning();

    return row;
  }

  async updateStatus(id: string, status: 'draft' | 'active' | 'inactive'): Promise<TourRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_tours)
      .set({ status })
      .where(eq(app_tours.id, id))
      .returning();

    return row;
  }

  async search(command: SearchTourCommand): Promise<{ data: TourRow[]; total: number }> {
    const conditions = applyFilters(tourFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(app_tours)
      .where(where);

    const data = await this.db
      .select()
      .from(app_tours)
      .where(where)
      .orderBy(desc(app_tours.createdAt))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total: Number(total) };
  }

  async getActive(): Promise<TourRow[]> {
    return this.db
      .select()
      .from(app_tours)
      .where(eq(app_tours.status, 'active'))
      .orderBy(app_tours.name);
  }
}
