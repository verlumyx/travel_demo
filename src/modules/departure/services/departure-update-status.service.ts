import type { UpdateStatusDepartureCommand } from '../commands/update-status-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureUpdateStatusService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(id: string, command: UpdateStatusDepartureCommand): Promise<DepartureRow> {
    return this.repository.updateStatus(id, command.status);
  }
}
