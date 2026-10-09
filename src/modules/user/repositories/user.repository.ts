import type { UserRow, NewUserRow } from '../models/user.model';
import type { CreateUserCommand } from '../commands/create-user.command';
import type { UpdateUserCommand } from '../commands/update-user.command';
import type { SearchUserCommand } from '../commands/search-user.command';

export interface UserWithRoleRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  roleName: string;
  rolePermissionType: string;
}

export interface UserRepository {
  create(command: CreateUserCommand): Promise<UserRow>;
  findById(id: string): Promise<UserRow | null>;
  findOrFail(id: string): Promise<UserRow>;
  update(id: string, command: UpdateUserCommand): Promise<UserRow>;
  updateStatus(id: string, status: string): Promise<UserRow>;
  search(command: SearchUserCommand): Promise<{ data: UserRow[], total: number }>;
  getAllWithRole(): Promise<UserWithRoleRow[]>;
}
