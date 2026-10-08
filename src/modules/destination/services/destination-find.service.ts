import type { DestinationRepository } from '../repositories/destination.repository';
import { toDestinationDto, type DestinationDto } from '../serializers/destination.serializer';

export class DestinationFindService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(id: string): Promise<DestinationDto> {
    const row = await this.repository.findOrFail(id);
    return toDestinationDto(row);
  }

  async getActive(): Promise<DestinationDto[]> {
    const rows = await this.repository.getActive();
    return rows.map(toDestinationDto);
  }
}
