import type { TourRepository } from '../repositories/tour.repository';
import type { UpdateTourCommand } from '../commands/update-tour.command';
import { toTourDto } from '../serializers/tour.serializer';

export class TourUpdateService {
  constructor(private readonly repository: TourRepository) {}

  async execute(id: string, command: UpdateTourCommand) {
    const row = await this.repository.update(id, command);
    return toTourDto(row);
  }
}
