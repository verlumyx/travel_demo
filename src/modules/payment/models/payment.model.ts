import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, text, numeric } from 'drizzle-orm/pg-core';
import { bookings } from '@/modules/booking/models/booking.model';
import { users } from '@/modules/user/models/user.model';

export const payments = pgTable('app_payments', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  method: varchar('method', { length: 50 }).notNull().$type<'pago_movil' | 'zelle' | 'binance' | 'zinli' | 'bank_transfer' | 'cash_usd' | 'cash_ves'>(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  reference: varchar('reference', { length: 255 }),
  proofImageUrl: varchar('proof_image_url', { length: 500 }),
  paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
  receivedByName: varchar('received_by_name', { length: 255 }),
  verifiedById: uuid('verified_by_id').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('pending').$type<'pending' | 'verified' | 'rejected'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('idx_app_payments_code').on(t.code),
  index('idx_app_payments_booking_id').on(t.bookingId),
  index('idx_app_payments_status').on(t.status)
]);

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
  verifiedBy: one(users, { fields: [payments.verifiedById], references: [users.id] })
}));

export const PAYMENT_CODE_PREFIX = 'PAG';
export const PAYMENT_CODE_WIDTH = 6;
export type PaymentRow = InferSelectModel<typeof payments>;
export type NewPaymentRow = InferInsertModel<typeof payments>;
