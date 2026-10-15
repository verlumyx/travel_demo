export interface SystemLogFilters {
  level?: 'error' | 'warn' | 'info';
  source?: string;
  status?: 'unread' | 'investigating' | 'resolved';
  search?: string;
  limit?: number;
  offset?: number;
}
