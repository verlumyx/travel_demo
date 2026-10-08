import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleDashboardRepository } from './repositories/drizzle-dashboard.repository';
import { DashboardMetricsService } from './services/dashboard-metrics.service';

export function createDashboardContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleDashboardRepository(db);
  return {
    metricsService: new DashboardMetricsService(repository),
  };
}
