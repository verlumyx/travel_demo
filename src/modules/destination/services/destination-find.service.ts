import type { DestinationRepository } from '../repositories/destination.repository';
import { toDestinationDto, type DestinationDto } from '../serializers/destination.serializer';

export class DestinationFindService {
  constructor(private readonly repository: DestinationRepository) {}

  async execute(id: string): Promise<DestinationDto> {
    const row = await this.repository.findOrFail(id);
    return toDestinationDto(row);
  }

  async findBySlug(slug: string): Promise<DestinationDto | null> {
    const row = await this.repository.findBySlug(slug);
    return row ? toDestinationDto(row) : null;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<DestinationDto | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const row = isUuid
      ? await this.repository.findById(idOrSlug)
      : await this.repository.findBySlug(idOrSlug);
    return row ? toDestinationDto(row) : null;
  }

  async getActive(): Promise<DestinationDto[]> {
    const rows = await this.repository.getActive();
    return rows.map(toDestinationDto);
  }
}
