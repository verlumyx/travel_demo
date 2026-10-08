import type { CategoryRow } from '../models/category.model';

export type CategoryDto = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string | null;
};

export function toCategoryDto(row: CategoryRow): CategoryDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    imageUrl: row.imageUrl,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
