import type { TourRepository } from '../repositories/tour.repository';
import { toTourDto } from '../serializers/tour.serializer';

export class TourFindService {
  constructor(private readonly repository: TourRepository) {}

  async execute(id: string) {
    const row = await this.repository.findOrFail(id);
    return toTourDto(row);
  }
}
