import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const app_payment_methods = pgTable(
  'app_payment_methods',
  {
    id: uuid('id').primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    instructions: text('instructions').notNull(),
    status: varchar('status', { length: 50 })
      .notNull()
      .default('active')
      .$type<'active' | 'inactive'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex('idx_payment_methods_code').on(t.code),
    index('idx_payment_methods_status').on(t.status),
    index('idx_payment_methods_currency').on(t.currency),
  ],
);

export const paymentMethods = app_payment_methods;

export const PAYMENT_METHOD_CODE_PREFIX = 'PMT';
export const PAYMENT_METHOD_CODE_WIDTH = 6;

export type PaymentMethodRow = InferSelectModel<typeof app_payment_methods>;
export type NewPaymentMethodRow = InferInsertModel<typeof app_payment_methods>;
