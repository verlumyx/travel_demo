import type { UpdateStatusDepartureCommand } from '../commands/update-status-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureUpdateStatusService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(command: UpdateStatusDepartureCommand): Promise<DepartureRow> {
    const departure = await this.repository.findOrFail(command.id);
    return this.repository.updateStatus(departure.id, command.status);
  }
}
