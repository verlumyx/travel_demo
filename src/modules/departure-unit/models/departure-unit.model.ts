import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { uuidv7 } from '@/modules/shared/uuid';
import { departures } from '@/modules/departure/models/departure.model';
import { transportUnits } from '@/modules/transport-unit/models/transport-unit.model';

export const departureUnits = pgTable('app_departure_units', {
  id: uuid('id').primaryKey().$defaultFn(uuidv7),
  departureId: uuid('departure_id').notNull().references(() => departures.id),
  transportUnitId: uuid('transport_unit_id').notNull().references(() => transportUnits.id),
  assignedCapacity: integer('assigned_capacity').notNull(),
  driverNameOverride: varchar('driver_name_override', { length: 255 }),
  driverPhoneOverride: varchar('driver_phone_override', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [
  index('app_departure_units_departure_id_idx').on(t.departureId),
  index('app_departure_units_transport_unit_id_idx').on(t.transportUnitId),
]);

export const departureUnitsRelations = relations(departureUnits, ({ one }) => ({
  departure: one(departures, {
    fields: [departureUnits.departureId],
    references: [departures.id],
  }),
  transportUnit: one(transportUnits, {
    fields: [departureUnits.transportUnitId],
    references: [transportUnits.id],
  }),
}));

export type DepartureUnitRow = InferSelectModel<typeof departureUnits>;
export type NewDepartureUnitRow = InferInsertModel<typeof departureUnits>;
