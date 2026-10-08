import type { DestinationRepository } from '../repositories/destination.repository';
import type { UpdateStatusDestinationCommand } from '../commands/update-status-destination.command';
import { toDestinationDto } from '../serializers/destination.serializer';

export class DestinationUpdateStatusService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(id: string, command: UpdateStatusDestinationCommand) {
    const row = await this.repository.updateStatus(id, command.status);
    return toDestinationDto(row);
  }
}
