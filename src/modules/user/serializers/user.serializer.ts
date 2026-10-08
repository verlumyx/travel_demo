import type { UserRow } from '../models/user.model';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  roleId: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export function toUserDto(row: UserRow): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleId: row.roleId,
    phone: row.phone,
    avatarUrl: row.avatarUrl,
    status: row.status,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
