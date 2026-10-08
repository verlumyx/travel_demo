import type { TourRow } from '../models/tour.model';

export interface TourDto {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  imageUrl?: string | null;
  durationDays: number;
  basePrice: string;
  currency: string;
  includesFood: boolean;
  includesLodging: boolean;
  inclusions?: string | null;
  exclusions?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export function toTourDto(row: TourRow): TourDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    imageUrl: row.imageUrl,
    durationDays: row.durationDays,
    basePrice: row.basePrice,
    currency: row.currency,
    includesFood: row.includesFood,
    includesLodging: row.includesLodging,
    inclusions: row.inclusions,
    exclusions: row.exclusions,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
