import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { app_roles } from '@/modules/role/models/role.model';

export const app_users = pgTable('app_users', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  roleId: uuid('role_id').notNull().references(() => app_roles.id),
  phone: varchar('phone', { length: 50 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('active').$type<'active' | 'inactive'>(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [uniqueIndex('idx_users_email').on(t.email), index('idx_users_role_status').on(t.roleId, t.status)]);

export const app_usersRelations = relations(app_users, ({ one }) => ({ role: one(app_roles, { fields: [app_users.roleId], references: [app_roles.id] }) }));

export const users = app_users;

export type UserRow = InferSelectModel<typeof app_users>;
export type NewUserRow = InferInsertModel<typeof app_users>;
