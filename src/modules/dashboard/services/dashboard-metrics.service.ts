import type {
  DashboardMetricsDto,
  DashboardRepository,
} from '../repositories/dashboard.repository';

export class DashboardMetricsService {
  constructor(private readonly repository: DashboardRepository) {}

  async execute(): Promise<DashboardMetricsDto> {
    return this.repository.getMetrics();
  }
}
