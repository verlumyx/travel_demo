import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuidv7 } from '@/modules/shared/uuid';
import { tours } from '@/modules/tour/models/tour.model';
import { destinations } from '@/modules/destination/models/destination.model';

export const itineraryStops = pgTable('app_itinerary_stops', {
  id: uuid('id').primaryKey().$defaultFn(uuidv7),
  tourId: uuid('tour_id').notNull().references(() => tours.id),
  destinationId: uuid('destination_id').notNull().references(() => destinations.id),
  dayNumber: integer('day_number').notNull(),
  sortOrder: integer('sort_order').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  overnightStay: boolean('overnight_stay').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index('app_itinerary_stops_tour_id_idx').on(t.tourId),
  index('app_itinerary_stops_destination_id_idx').on(t.destinationId),
]);

export const itineraryStopsRelations = relations(itineraryStops, ({ one }) => ({
  tour: one(tours, {
    fields: [itineraryStops.tourId],
    references: [tours.id],
  }),
  destination: one(destinations, {
    fields: [itineraryStops.destinationId],
    references: [destinations.id],
  }),
}));

export type ItineraryStopRow = InferSelectModel<typeof itineraryStops>;
export type NewItineraryStopRow = InferInsertModel<typeof itineraryStops>;
