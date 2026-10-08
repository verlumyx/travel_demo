import type { SearchTransportUnitCommand } from '../commands/search-transport-unit.command';
import type { TransportUnitRepository } from '../repositories/transport-unit.repository';
import type { TransportUnitRow } from '../models/transport-unit.model';

export class TransportUnitSearchService {
  constructor(private readonly repository: TransportUnitRepository) {}

  async execute(command: SearchTransportUnitCommand): Promise<{ items: TransportUnitRow[]; total: number }> {
    return this.repository.search(command.filters, command.limit, command.offset);
  }
}
