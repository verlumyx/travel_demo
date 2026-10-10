import type { TourRow } from '../models/tour.model';
import type { CreateTourCommand } from '../commands/create-tour.command';
import type { UpdateTourCommand } from '../commands/update-tour.command';
import type { SearchTourCommand } from '../commands/search-tour.command';

export interface CatalogTourItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: string;
  currency: string;
  durationDays: number;
  imageUrl: string | null;
  includesFood: boolean;
  includesLodging: boolean;
  status: string;
  createdAt: Date;
  destinationName?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  upcomingDeparturesCount: number;
  nextDepartureDate?: Date | null;
  nextDepartureSlots: number;
}

export interface TourRepository {
  create(command: CreateTourCommand): Promise<TourRow>;
  findById(id: string): Promise<TourRow | null>;
  findOrFail(id: string): Promise<TourRow>;
  findBySlug(slug: string): Promise<TourRow | null>;
  update(id: string, command: UpdateTourCommand): Promise<TourRow>;
  updateStatus(id: string, status: 'draft' | 'active' | 'inactive'): Promise<TourRow>;
  search(command: SearchTourCommand): Promise<{ data: TourRow[]; total: number }>;
  getActive(): Promise<TourRow[]>;
  getCatalogTours(filters?: { q?: string; maxPrice?: number; duration?: number; destinationId?: string }): Promise<CatalogTourItem[]>;
}
