import type { RoleRow } from '../models/role.model';

export interface RoleDto {
  id: string;
  name: string;
  description?: string | null;
  permissionType: string;
  permissions: string[];
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export function toRoleDto(row: RoleRow): RoleDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    permissionType: row.permissionType,
    permissions: row.permissions,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
