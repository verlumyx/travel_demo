import type { TourRow } from '../models/tour.model';
import type { CreateTourCommand } from '../commands/create-tour.command';
import type { UpdateTourCommand } from '../commands/update-tour.command';
import type { SearchTourCommand } from '../commands/search-tour.command';

export interface TourRepository {
  create(command: CreateTourCommand): Promise<TourRow>;
  findById(id: string): Promise<TourRow | null>;
  findOrFail(id: string): Promise<TourRow>;
  findBySlug(slug: string): Promise<TourRow | null>;
  update(id: string, command: UpdateTourCommand): Promise<TourRow>;
  updateStatus(id: string, status: 'draft' | 'active' | 'inactive'): Promise<TourRow>;
  search(command: SearchTourCommand): Promise<{ data: TourRow[]; total: number }>;
  getActive(): Promise<TourRow[]>;
}
