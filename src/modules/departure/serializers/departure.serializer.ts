import type { DepartureRow } from '../models/departure.model';
import type { ScheduledDeparturePublicItem } from '../repositories/departure.repository';

export type DepartureDto = {
  id: string;
  code: string;
  tourId: string;
  departureDate: string;
  returnDate: string | null;
  meetingPoint: string | null;
  meetingTime: string | null;
  priceOverride: string | null;
  totalCapacity: number;
  bookedSlots: number;
  availableSlots: number;
  occupancyPercent: number;
  notes: string | null;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string | null;
  tourName?: string;
  tourCode?: string;
};

export function toDepartureDto(
  row: DepartureRow & { tourName?: string; tourCode?: string },
): DepartureDto {
  const availableSlots = Math.max(0, row.totalCapacity - row.bookedSlots);
  const occupancyPercent =
    row.totalCapacity > 0
      ? Math.round((row.bookedSlots / row.totalCapacity) * 100)
      : 0;

  return {
    id: row.id,
    code: row.code,
    tourId: row.tourId,
    departureDate: row.departureDate.toISOString(),
    returnDate: row.returnDate?.toISOString() ?? null,
    meetingPoint: row.meetingPoint,
    meetingTime: row.meetingTime,
    priceOverride: row.priceOverride,
    totalCapacity: row.totalCapacity,
    bookedSlots: row.bookedSlots,
    availableSlots,
    occupancyPercent,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    tourName: row.tourName,
    tourCode: row.tourCode,
  };
}

export type ScheduledDepartureDto = {
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
  departureDate: string;
  returnDate: string | null;
  meetingPoint: string | null;
  meetingTime: string | null;
  priceOverride: string | null;
  effectivePrice: string;
  totalCapacity: number;
  bookedSlots: number;
  availableSlots: number;
  status: 'scheduled' | 'confirmed';
};

export function toScheduledDepartureDto(
  item: ScheduledDeparturePublicItem,
): ScheduledDepartureDto {
  return {
    ...item,
    departureDate: item.departureDate.toISOString(),
    returnDate: item.returnDate ? item.returnDate.toISOString() : null,
  };
}
