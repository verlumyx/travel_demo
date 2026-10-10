import type { DepartureRepository } from '../repositories/departure.repository';
import {
  toScheduledDepartureDto,
  type ScheduledDepartureDto,
} from '../serializers/departure.serializer';

export class DepartureUpcomingService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(limit: number = 20): Promise<ScheduledDepartureDto[]> {
    const items = await this.repository.getUpcomingDepartures(limit);
    return items.map(toScheduledDepartureDto);
  }
}
