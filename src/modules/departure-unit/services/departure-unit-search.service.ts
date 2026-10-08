import type { SearchDepartureUnitCommand } from '../commands/search-departure-unit.command';
import type { DepartureUnitRepository } from '../repositories/departure-unit.repository';
import type { DepartureUnitRow } from '../models/departure-unit.model';

export class DepartureUnitSearchService {
  constructor(private readonly repository: DepartureUnitRepository) {}

  async execute(command: SearchDepartureUnitCommand): Promise<{ items: DepartureUnitRow[]; total: number }> {
    return this.repository.search(command.filters, command.limit, command.offset);
  }
}
