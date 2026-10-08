import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';

export const app_roles = pgTable('app_roles', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  permissionType: varchar('permission_type', { length: 50 }).notNull().default('custom').$type<'all' | 'custom'>(),
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  status: varchar('status', { length: 50 }).notNull().default('active').$type<'active' | 'inactive'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [uniqueIndex('idx_roles_name').on(t.name), index('idx_roles_status').on(t.status)]);



export type RoleRow = InferSelectModel<typeof app_roles>;
export type NewRoleRow = InferInsertModel<typeof app_roles>;
