import type { DepartureRow } from '../models/departure.model';
import type { TourRow } from '@/modules/tour/models/tour.model';
import type { CreateDepartureCommand } from '../commands/create-departure.command';
import type { UpdateDepartureCommand } from '../commands/update-departure.command';
import type { SearchDepartureCommand } from '../commands/search-departure.command';

export type DepartureWithTourRow = DepartureRow & {
  tourName: string;
  tourCode: string;
};

export interface DepartureRepository {
  create(command: CreateDepartureCommand): Promise<DepartureRow>;
  findById(id: string): Promise<DepartureRow | null>;
  findOrFail(id: string): Promise<DepartureRow>;
  findByIdWithTour(id: string): Promise<{ departure: DepartureRow; tour: TourRow } | null>;
  findOrFailWithTour(id: string): Promise<{ departure: DepartureRow; tour: TourRow }>;
  update(id: string, command: UpdateDepartureCommand): Promise<DepartureRow>;
  updateStatus(id: string, status: DepartureRow['status']): Promise<DepartureRow>;
  updateCapacity(id: string, totalCapacity: number): Promise<DepartureRow>;
  search(command: SearchDepartureCommand): Promise<{ data: DepartureWithTourRow[]; total: number }>;
  findByTourId(tourId: string): Promise<DepartureRow[]>;
}
