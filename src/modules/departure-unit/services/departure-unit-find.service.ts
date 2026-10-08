import type {
  DepartureUnitRepository,
  DepartureUnitWithDetailsRow,
} from '../repositories/departure-unit.repository';
import type { DepartureUnitRow } from '../models/departure-unit.model';

export class DepartureUnitFindService {
  constructor(private readonly repository: DepartureUnitRepository) {}

  async execute(id: string): Promise<DepartureUnitRow> {
    return this.repository.findOrFail(id);
  }

  async findByDepartureId(
    departureId: string,
  ): Promise<DepartureUnitWithDetailsRow[]> {
    return this.repository.findByDepartureId(departureId);
  }
}
