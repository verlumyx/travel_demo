import type { DestinationRepository } from '../repositories/destination.repository';
import type { UpdateDestinationCommand } from '../commands/update-destination.command';
import { toDestinationDto } from '../serializers/destination.serializer';

export class DestinationUpdateService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(id: string, command: UpdateDestinationCommand) {
    const row = await this.repository.update(id, command);
    return toDestinationDto(row);
  }
}
