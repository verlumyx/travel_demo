import type { TourRepository, CatalogTourItem } from '../repositories/tour.repository';

export interface TourCatalogFilters {
  q?: string;
  maxPrice?: number;
  duration?: number;
  destinationId?: string;
}

export class TourCatalogService {
  constructor(private readonly repository: TourRepository) {}

  async execute(filters?: TourCatalogFilters): Promise<CatalogTourItem[]> {
    return this.repository.getCatalogTours(filters);
  }
}
