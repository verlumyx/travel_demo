import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { app_destinations } from '@/modules/destination/models/destination.model';

export const app_categories = pgTable(
  'app_categories',
  {
    id: uuid('id').primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    icon: varchar('icon', { length: 100 }),
    imageUrl: varchar('image_url', { length: 500 }),
    status: varchar('status', { length: 50 }).notNull().default('active').$type<'active' | 'inactive'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex('idx_categories_code').on(t.code),
    uniqueIndex('idx_categories_slug').on(t.slug),
    index('idx_categories_status').on(t.status),
  ],
);

export const app_categoriesRelations = relations(app_categories, ({ many }) => ({
  destinations: many(app_destinations),
}));

export const CATEGORY_CODE_PREFIX = 'CAT';
export const CATEGORY_CODE_WIDTH = 6;

export const categories = app_categories;

export type CategoryRow = InferSelectModel<typeof app_categories>;
export type NewCategoryRow = InferInsertModel<typeof app_categories>;
