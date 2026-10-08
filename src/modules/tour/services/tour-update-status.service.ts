import type { TourRepository } from '../repositories/tour.repository';
import type { UpdateStatusTourCommand } from '../commands/update-status-tour.command';
import { toTourDto } from '../serializers/tour.serializer';

export class TourUpdateStatusService {
  constructor(private readonly repository: TourRepository) {}

  async execute(id: string, command: UpdateStatusTourCommand) {
    const row = await this.repository.updateStatus(id, command.status);
    return toTourDto(row);
  }
}
