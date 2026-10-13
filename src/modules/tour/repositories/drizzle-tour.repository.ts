import { and, desc, eq, like, count, lte, ilike, or, inArray } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  app_tours,
  TOUR_CODE_PREFIX,
  TOUR_CODE_WIDTH,
  type TourRow,
} from '../models/tour.model';
import { departures } from '@/modules/departure/models/departure.model';
import { itineraryStops } from '@/modules/itinerary-stop/models/itinerary-stop.model';
import { app_destinations } from '@/modules/destination/models/destination.model';
import { app_categories } from '@/modules/category/models/category.model';
import type { TourRepository, CatalogTourItem } from './tour.repository';
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
      .orderBy(desc(app_tours.code))
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

  async getCatalogTours(filters?: { q?: string; maxPrice?: number; duration?: number; destinationId?: string }): Promise<CatalogTourItem[]> {
    const conditions = [eq(app_tours.status, 'active')];

    if (filters?.destinationId) {
      const stops = await this.db
        .select({ tourId: itineraryStops.tourId })
        .from(itineraryStops)
        .where(eq(itineraryStops.destinationId, filters.destinationId));

      const tourIds = Array.from(new Set(stops.map((s) => s.tourId)));
      if (tourIds.length === 0) {
        return [];
      }
      conditions.push(inArray(app_tours.id, tourIds));
    }

    if (filters?.q && filters.q.trim()) {
      conditions.push(
        or(
          ilike(app_tours.name, `%${filters.q.trim()}%`),
          ilike(app_tours.description, `%${filters.q.trim()}%`),
          ilike(app_tours.shortDescription, `%${filters.q.trim()}%`),
        )!,
      );
    }

    if (filters?.maxPrice && Number(filters.maxPrice) > 0) {
      conditions.push(lte(app_tours.basePrice, String(filters.maxPrice)));
    }

    if (filters?.duration && Number(filters.duration) > 0) {
      conditions.push(lte(app_tours.durationDays, Number(filters.duration)));
    }

    const allActiveTours = await this.db
      .select()
      .from(app_tours)
      .where(and(...conditions))
      .orderBy(desc(app_tours.createdAt));

    return Promise.all(
      allActiveTours.map(async (t) => {
        const futureDepartures = await this.db
          .select()
          .from(departures)
          .where(
            and(
              eq(departures.tourId, t.id),
              eq(departures.status, 'scheduled'),
            ),
          )
          .orderBy(departures.departureDate)
          .limit(3);

        const [stop] = await this.db
          .select({
            destinationName: app_destinations.name,
            categoryName: app_categories.name,
            categorySlug: app_categories.slug,
          })
          .from(itineraryStops)
          .innerJoin(app_destinations, eq(itineraryStops.destinationId, app_destinations.id))
          .leftJoin(app_categories, eq(app_destinations.categoryId, app_categories.id))
          .where(
            filters?.destinationId
              ? and(eq(itineraryStops.tourId, t.id), eq(itineraryStops.destinationId, filters.destinationId))
              : eq(itineraryStops.tourId, t.id),
          )
          .limit(1);

        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          code: t.code,
          description: t.description,
          shortDescription: t.shortDescription,
          basePrice: t.basePrice,
          currency: t.currency,
          durationDays: t.durationDays,
          imageUrl: t.imageUrl,
          includesFood: t.includesFood,
          includesLodging: t.includesLodging,
          status: t.status,
          createdAt: t.createdAt,
          destinationName: stop?.destinationName ?? null,
          categoryName: stop?.categoryName ?? null,
          categorySlug: stop?.categorySlug ?? null,
          upcomingDeparturesCount: futureDepartures.length,
          nextDepartureDate: futureDepartures[0]?.departureDate ?? null,
          nextDepartureSlots: futureDepartures[0]
            ? futureDepartures[0].totalCapacity - futureDepartures[0].bookedSlots
            : 0,
        };
      }),
    );
  }
}
