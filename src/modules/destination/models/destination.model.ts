import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, text } from 'drizzle-orm/pg-core';

import { app_categories } from '@/modules/category/models/category.model';

export const app_destinations = pgTable('app_destinations', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  categoryId: uuid('category_id').references(() => app_categories.id),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  state: varchar('state', { length: 100 }),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull().default('Venezuela'),
  status: varchar('status', { length: 50 }).notNull().default('active').$type<'active' | 'inactive'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('idx_dest_code').on(t.code),
  uniqueIndex('idx_dest_slug').on(t.slug),
  index('idx_dest_category').on(t.categoryId),
  index('idx_dest_status').on(t.status),
]);

export const app_destinationsRelations = relations(app_destinations, ({ one }) => ({
  category: one(app_categories, {
    fields: [app_destinations.categoryId],
    references: [app_categories.id],
  }),
}));

export const DESTINATION_CODE_PREFIX = 'DES';
export const DESTINATION_CODE_WIDTH = 6;

export const destinations = app_destinations;

export type DestinationRow = InferSelectModel<typeof app_destinations>;
export type NewDestinationRow = InferInsertModel<typeof app_destinations>;
