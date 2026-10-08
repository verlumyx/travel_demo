import type { RoleRow, NewRoleRow } from '../models/role.model';
import type { CreateRoleCommand } from '../commands/create-role.command';
import type { UpdateRoleCommand } from '../commands/update-role.command';
import type { SearchRoleCommand } from '../commands/search-role.command';

export interface RoleRepository {
  create(command: CreateRoleCommand): Promise<RoleRow>;
  findById(id: string): Promise<RoleRow | null>;
  findOrFail(id: string): Promise<RoleRow>;
  update(id: string, command: UpdateRoleCommand): Promise<RoleRow>;
  updateStatus(id: string, status: string): Promise<RoleRow>;
  search(command: SearchRoleCommand): Promise<{ data: RoleRow[], total: number }>;
}
