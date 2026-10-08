import type { DestinationRow } from '../models/destination.model';

export interface DestinationDto {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  state?: string | null;
  city?: string | null;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export function toDestinationDto(row: DestinationRow): DestinationDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    state: row.state,
    city: row.city,
    country: row.country,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
