import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { tours } from '@/modules/tour/models/tour.model';
import { departureUnits } from '@/modules/departure-unit/models/departure-unit.model';
// import { bookings } from '@/modules/booking/models/booking.model'; // Assumed if exists

export const DEPARTURE_CODE_PREFIX = 'SAL';
export const DEPARTURE_CODE_WIDTH = 6;

export const departures = pgTable('app_departures', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  tourId: uuid('tour_id').notNull().references(() => tours.id),
  departureDate: timestamp('departure_date', { withTimezone: true }).notNull(),
  returnDate: timestamp('return_date', { withTimezone: true }),
  meetingPoint: varchar('meeting_point', { length: 255 }),
  meetingTime: varchar('meeting_time', { length: 10 }),
  priceOverride: numeric('price_override', { precision: 12, scale: 2 }),
  totalCapacity: integer('total_capacity').notNull(),
  bookedSlots: integer('booked_slots').notNull().default(0),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('scheduled').$type<'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('app_departures_code_idx').on(t.code),
  index('app_departures_tour_id_idx').on(t.tourId),
  index('app_departures_status_date_idx').on(t.status, t.departureDate),
]);

export const departuresRelations = relations(departures, ({ one, many }) => ({
  tour: one(tours, {
    fields: [departures.tourId],
    references: [tours.id],
  }),
  departureUnits: many(departureUnits),
  // bookings: many(bookings),
}));

export type DepartureRow = InferSelectModel<typeof departures>;
export type NewDepartureRow = InferInsertModel<typeof departures>;

export const app_departures = departures;
