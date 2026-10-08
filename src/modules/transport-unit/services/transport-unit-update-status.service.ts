import type { UpdateStatusTransportUnitCommand } from '../commands/update-status-transport-unit.command';
import type { TransportUnitRepository } from '../repositories/transport-unit.repository';
import type { TransportUnitRow } from '../models/transport-unit.model';

export class TransportUnitUpdateStatusService {
  constructor(private readonly repository: TransportUnitRepository) {}

  async execute(command: UpdateStatusTransportUnitCommand): Promise<TransportUnitRow> {
    const unit = await this.repository.findOrFail(command.id);
    return this.repository.updateStatus(unit.id, command.status);
  }
}
