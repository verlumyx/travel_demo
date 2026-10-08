import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';

export class DepartureFindService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(id: string): Promise<DepartureRow> {
    return this.repository.findOrFail(id);
  }
}
