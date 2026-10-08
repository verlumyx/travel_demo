import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { departureUnits } from '@/modules/departure-unit/models/departure-unit.model';

export const TRANSPORT_UNIT_CODE_PREFIX = 'UNI';
export const TRANSPORT_UNIT_CODE_WIDTH = 6;

export const transportUnits = pgTable('app_transport_units', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().$type<'bus' | 'minibus' | 'van' | 'boat' | 'other'>(),
  plateNumber: varchar('plate_number', { length: 20 }),
  capacity: integer('capacity').notNull(),
  driverName: varchar('driver_name', { length: 255 }),
  driverPhone: varchar('driver_phone', { length: 50 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('active').$type<'active' | 'inactive' | 'maintenance'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('app_transport_units_code_idx').on(t.code),
  index('app_transport_units_status_idx').on(t.status),
]);

export const transportUnitsRelations = relations(transportUnits, ({ many }) => ({
  departureUnits: many(departureUnits),
}));

export type TransportUnitRow = InferSelectModel<typeof transportUnits>;
export type NewTransportUnitRow = InferInsertModel<typeof transportUnits>;
