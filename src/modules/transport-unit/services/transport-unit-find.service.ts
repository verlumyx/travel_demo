import type { TransportUnitRepository } from '../repositories/transport-unit.repository';
import type { TransportUnitRow } from '../models/transport-unit.model';

export class TransportUnitFindService {
  constructor(private readonly repository: TransportUnitRepository) {}

  async execute(id: string): Promise<TransportUnitRow> {
    return this.repository.findOrFail(id);
  }
}
