import { and, desc, eq, like, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  app_categories,
  CATEGORY_CODE_PREFIX,
  CATEGORY_CODE_WIDTH,
  type CategoryRow,
} from '../models/category.model';
import type { CategoryRepository } from './category.repository';
import { categoryFilters } from './category.filters';
import type { CreateCategoryCommand } from '../commands/create-category.command';
import type { UpdateCategoryCommand } from '../commands/update-category.command';
import type { UpdateStatusCategoryCommand } from '../commands/update-status-category.command';
import type { SearchCategoryCommand } from '../commands/search-category.command';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';

export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreateCategoryCommand): Promise<CategoryRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(app_categories)
      .values({
        id: command.id,
        code,
        name: command.name,
        slug: command.slug,
        description: command.description,
        icon: command.icon,
        status: 'active',
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<CategoryRow | null> {
    const [row] = await this.db
      .select()
      .from(app_categories)
      .where(eq(app_categories.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<CategoryRow> {
    const row = await this.findById(id);
    if (!row) throw new CategoryNotFoundException(id);
    return row;
  }

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const [row] = await this.db
      .select()
      .from(app_categories)
      .where(eq(app_categories.slug, slug))
      .limit(1);

    return row ?? null;
  }

  async update(id: string, command: UpdateCategoryCommand): Promise<CategoryRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_categories)
      .set({
        name: command.name,
        slug: command.slug,
        description: command.description,
        icon: command.icon,
      })
      .where(eq(app_categories.id, id))
      .returning();

    return row;
  }

  async updateStatus(id: string, command: UpdateStatusCategoryCommand): Promise<CategoryRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_categories)
      .set({ status: command.status })
      .where(eq(app_categories.id, id))
      .returning();

    return row;
  }

  async search(command: SearchCategoryCommand): Promise<{ data: CategoryRow[]; total: number }> {
    const conditions = applyFilters(categoryFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(app_categories)
      .where(where);

    const data = await this.db
      .select()
      .from(app_categories)
      .where(where)
      .orderBy(desc(app_categories.code))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total: Number(total) };
  }

  async getActive(): Promise<CategoryRow[]> {
    return this.db
      .select()
      .from(app_categories)
      .where(eq(app_categories.status, 'active'))
      .orderBy(app_categories.name);
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(app_categories.code, `${CATEGORY_CODE_PREFIX}%`);

    // Lock the highest row for update in the transaction
    await this.db
      .select({ id: app_categories.id })
      .from(app_categories)
      .where(scope)
      .orderBy(desc(app_categories.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: app_categories.code })
      .from(app_categories)
      .where(scope)
      .orderBy(desc(app_categories.code))
      .limit(1);

    const next = last ? Number(last.code.slice(CATEGORY_CODE_PREFIX.length)) + 1 : 1;
    return `${CATEGORY_CODE_PREFIX}${String(next).padStart(CATEGORY_CODE_WIDTH, '0')}`;
  }
}
