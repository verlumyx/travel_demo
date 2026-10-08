import type { DestinationRepository } from '../repositories/destination.repository';
import type { CreateDestinationCommand } from '../commands/create-destination.command';
import { toDestinationDto } from '../serializers/destination.serializer';

export class DestinationCreateService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(command: CreateDestinationCommand) {
    const row = await this.repository.create(command);
    return toDestinationDto(row);
  }
}
