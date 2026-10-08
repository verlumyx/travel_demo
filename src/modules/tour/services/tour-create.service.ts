import type { TourRepository } from '../repositories/tour.repository';
import type { CreateTourCommand } from '../commands/create-tour.command';
import { toTourDto } from '../serializers/tour.serializer';

export class TourCreateService {
  constructor(private readonly repository: TourRepository) {}

  async execute(command: CreateTourCommand) {
    const row = await this.repository.create(command);
    return toTourDto(row);
  }
}
