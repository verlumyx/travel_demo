import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { bookings } from '@/modules/booking/models/booking.model';

export const customers = pgTable('app_customers', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  supabaseUserId: varchar('supabase_user_id', { length: 255 }).unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  documentType: varchar('document_type', { length: 20 }).$type<'cedula' | 'passport' | 'other'>(),
  documentNumber: varchar('document_number', { length: 50 }),
  birthDate: timestamp('birth_date', { withTimezone: true }),
  emergencyContact: varchar('emergency_contact', { length: 255 }),
  emergencyPhone: varchar('emergency_phone', { length: 50 }),
  notes: text('notes'),
  source: varchar('source', { length: 50 }).notNull().default('admin').$type<'admin' | 'portal' | 'whatsapp' | 'instagram'>(),
  status: varchar('status', { length: 50 }).notNull().default('active').$type<'active' | 'inactive'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('idx_app_customers_code').on(t.code),
  uniqueIndex('idx_app_customers_supabase_user_id').on(t.supabaseUserId),
  index('idx_app_customers_email').on(t.email),
  index('idx_app_customers_status').on(t.status)
]);

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));

export const CUSTOMER_CODE_PREFIX = 'CLI';
export const CUSTOMER_CODE_WIDTH = 6;
export type CustomerRow = InferSelectModel<typeof customers>;
export type NewCustomerRow = InferInsertModel<typeof customers>;
