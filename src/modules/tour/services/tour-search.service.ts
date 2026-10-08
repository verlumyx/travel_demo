import type { TourRepository } from '../repositories/tour.repository';
import type { SearchTourCommand } from '../commands/search-tour.command';
import { toTourDto } from '../serializers/tour.serializer';

export class TourSearchService {
  constructor(private readonly repository: TourRepository) {}

  async execute(command: SearchTourCommand) {
    const { data, total } = await this.repository.search(command);
    return { data: data.map(toTourDto), total };
  }
}
