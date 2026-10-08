import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, text, integer, numeric, boolean } from 'drizzle-orm/pg-core';

export const app_tours = pgTable('app_tours', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  durationDays: integer('duration_days').notNull().default(1),
  basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  includesFood: boolean('includes_food').notNull().default(false),
  includesLodging: boolean('includes_lodging').notNull().default(false),
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  status: varchar('status', { length: 50 }).notNull().default('draft').$type<'draft' | 'active' | 'inactive'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [uniqueIndex('idx_tour_code').on(t.code), uniqueIndex('idx_tour_slug').on(t.slug), index('idx_tour_status').on(t.status)]);

export const app_toursRelations = relations(app_tours, ({ many }) => ({ itineraryStops: many(app_tours), departures: many(app_tours) })); // mocked self relation for now

export const TOUR_CODE_PREFIX = 'TUR';
export const TOUR_CODE_WIDTH = 6;

export const tours = app_tours;

export type TourRow = InferSelectModel<typeof app_tours>;
export type NewTourRow = InferInsertModel<typeof app_tours>;
