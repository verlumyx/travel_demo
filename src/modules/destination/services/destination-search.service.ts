import type { DestinationRepository } from '../repositories/destination.repository';
import type { SearchDestinationCommand } from '../commands/search-destination.command';
import { toDestinationDto } from '../serializers/destination.serializer';

export class DestinationSearchService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(command: SearchDestinationCommand) {
    const { data, total } = await this.repository.search(command);
    return { data: data.map(toDestinationDto), total };
  }
}
