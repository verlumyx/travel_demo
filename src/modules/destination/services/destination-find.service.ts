import type { DestinationRepository } from '../repositories/destination.repository';
import { toDestinationDto } from '../serializers/destination.serializer';

export class DestinationFindService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(id: string) {
    const row = await this.repository.findOrFail(id);
    return toDestinationDto(row);
  }
}
