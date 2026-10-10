import type { DepartureRow } from '../models/departure.model';
import type { TourRow } from '@/modules/tour/models/tour.model';
import type { CreateDepartureCommand } from '../commands/create-departure.command';
import type { UpdateDepartureCommand } from '../commands/update-departure.command';
import type { SearchDepartureCommand } from '../commands/search-departure.command';

export type DepartureWithTourRow = DepartureRow & {
  tourName: string;
  tourCode: string;
};

export interface DepartureForBookingOption {
  id: string;
  code: string;
  departureDate: Date;
  totalCapacity: number;
  bookedSlots: number;
  priceOverride: string | null;
  tourName: string;
  tourCode: string;
  tourBasePrice: string;
}

export interface ScheduledDeparturePublicItem {
  id: string;
  code: string;
  tourId: string;
  tourName: string;
  tourSlug: string;
  tourCode: string;
  tourImageUrl: string | null;
  tourDurationDays: number;
  tourShortDescription: string | null;
  tourBasePrice: string;
  currency: string;
  departureDate: Date;
  returnDate: Date | null;
  meetingPoint: string | null;
  meetingTime: string | null;
  priceOverride: string | null;
  effectivePrice: string;
  totalCapacity: number;
  bookedSlots: number;
  availableSlots: number;
  status: 'scheduled' | 'confirmed';
}

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
  getActiveScheduled(): Promise<DepartureForBookingOption[]>;
  getUpcomingDepartures(limit?: number): Promise<ScheduledDeparturePublicItem[]>;
}
