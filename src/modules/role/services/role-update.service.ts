import type { RoleRepository } from '../repositories/role.repository';
import type { UpdateRoleCommand } from '../commands/update-role.command';
import { toRoleDto } from '../serializers/role.serializer';

export class RoleUpdateService {
  constructor(private readonly repository: RoleRepository) {}

  async execute(id: string, command: UpdateRoleCommand) {
    const row = await this.repository.update(id, command);
    return toRoleDto(row);
  }
}
