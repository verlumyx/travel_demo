import type { DepartureRepository } from '../repositories/departure.repository';
import type { DepartureRow } from '../models/departure.model';
import type { TourRow } from '@/modules/tour/models/tour.model';

export class DepartureFindService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(id: string): Promise<DepartureRow | null> {
    return this.repository.findById(id);
  }

  async executeOrFail(id: string): Promise<DepartureRow> {
    return this.repository.findOrFail(id);
  }

  async executeWithTour(
    id: string,
  ): Promise<{ departure: DepartureRow; tour: TourRow }> {
    return this.repository.findOrFailWithTour(id);
  }
}
