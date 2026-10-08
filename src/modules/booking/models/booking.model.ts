import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, text, integer, numeric } from 'drizzle-orm/pg-core';
import { departures } from '@/modules/departure/models/departure.model';
import { customers } from '@/modules/customer/models/customer.model';
import { users } from '@/modules/user/models/user.model';
import { passengers } from '@/modules/passenger/models/passenger.model';
import { payments } from '@/modules/payment/models/payment.model';

export const bookings = pgTable('app_bookings', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  departureId: uuid('departure_id').notNull().references(() => departures.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  slotsReserved: integer('slots_reserved').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  source: varchar('source', { length: 50 }).notNull().default('admin').$type<'admin' | 'portal'>(),
  createdById: uuid('created_by_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending').$type<'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('idx_app_bookings_code').on(t.code),
  index('idx_app_bookings_departure_id').on(t.departureId),
  index('idx_app_bookings_customer_id').on(t.customerId),
  index('idx_app_bookings_status').on(t.status)
]);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  departure: one(departures, { fields: [bookings.departureId], references: [departures.id] }),
  customer: one(customers, { fields: [bookings.customerId], references: [customers.id] }),
  createdBy: one(users, { fields: [bookings.createdById], references: [users.id] }),
  passengers: many(passengers),
  payments: many(payments)
}));

export const BOOKING_CODE_PREFIX = 'RES';
export const BOOKING_CODE_WIDTH = 6;
export type BookingRow = InferSelectModel<typeof bookings>;
export type NewBookingRow = InferInsertModel<typeof bookings>;
