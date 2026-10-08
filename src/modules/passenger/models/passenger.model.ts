import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uuid, varchar, text, boolean } from 'drizzle-orm/pg-core';
import { bookings } from '@/modules/booking/models/booking.model';
import { uuidv7 } from '@/modules/shared/uuid';

export const passengers = pgTable('app_passengers', {
  id: uuid('id').primaryKey().$defaultFn(uuidv7),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  documentType: varchar('document_type', { length: 20 }).$type<'cedula' | 'passport' | 'other'>(),
  documentNumber: varchar('document_number', { length: 50 }),
  phone: varchar('phone', { length: 50 }),
  isMainContact: boolean('is_main_contact').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index('idx_app_passengers_booking_id').on(t.bookingId)
]);

export const passengersRelations = relations(passengers, ({ one }) => ({
  booking: one(bookings, { fields: [passengers.bookingId], references: [bookings.id] })
}));

export type PassengerRow = InferSelectModel<typeof passengers>;
export type NewPassengerRow = InferInsertModel<typeof passengers>;
