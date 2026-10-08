import type { CreateDepartureCommand } from '../commands/create-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureCreateService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(command: CreateDepartureCommand): Promise<DepartureRow> {
    return this.repository.create(command);
  }
}
