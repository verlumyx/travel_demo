import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const systemLogs = pgTable(
  'app_system_logs',
  {
    id: uuid('id').primaryKey(),
    level: varchar('level', { length: 20 })
      .notNull()
      .default('error')
      .$type<'error' | 'warn' | 'info'>(),
    source: varchar('source', { length: 100 }).notNull().default('system'),
    message: text('message').notNull(),
    errorName: varchar('error_name', { length: 150 }),
    stack: text('stack'),
    path: varchar('path', { length: 500 }),
    action: varchar('action', { length: 100 }),
    context: jsonb('context').$type<Record<string, unknown>>(),
    ip: varchar('ip', { length: 100 }),
    userAgent: varchar('user_agent', { length: 500 }),
    status: varchar('status', { length: 50 })
      .notNull()
      .default('unread')
      .$type<'unread' | 'investigating' | 'resolved'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_app_system_logs_level').on(t.level),
    index('idx_app_system_logs_source').on(t.source),
    index('idx_app_system_logs_status').on(t.status),
    index('idx_app_system_logs_created_at').on(t.createdAt),
  ],
);

export type SystemLogRow = InferSelectModel<typeof systemLogs>;
export type NewSystemLogRow = InferInsertModel<typeof systemLogs>;
