import type { SearchDepartureCommand } from '../commands/search-departure.command';
import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureSearchService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(command: SearchDepartureCommand): Promise<{ items: DepartureRow[]; total: number }> {
    return this.repository.search(command.filters, command.limit, command.offset);
  }
}
