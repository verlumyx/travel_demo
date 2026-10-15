import { SystemLogRow } from '../models/system-log.model';

export interface SystemLogDto {
  id: string;
  level: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  errorName?: string | null;
  stack?: string | null;
  path?: string | null;
  action?: string | null;
  context?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  status: 'unread' | 'investigating' | 'resolved';
  createdAt: string;
}

export function toSystemLogDto(row: SystemLogRow): SystemLogDto {
  return {
    id: row.id,
    level: row.level,
    source: row.source,
    message: row.message,
    errorName: row.errorName,
    stack: row.stack,
    path: row.path,
    action: row.action,
    context: row.context,
    ip: row.ip,
    userAgent: row.userAgent,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
