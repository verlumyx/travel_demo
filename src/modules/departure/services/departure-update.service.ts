import type { UpdateDepartureCommand } from '../commands/update-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureUpdateService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(id: string, command: UpdateDepartureCommand): Promise<DepartureRow> {
    return this.repository.update(id, command);
  }
}
