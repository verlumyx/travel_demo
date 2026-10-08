import type { RoleRepository } from '../repositories/role.repository';
import type { UpdateStatusRoleCommand } from '../commands/update-status-role.command';
import { toRoleDto } from '../serializers/role.serializer';

export class RoleUpdateStatusService {
  constructor(private readonly repository: RoleRepository) {}

  async execute(id: string, command: UpdateStatusRoleCommand) {
    const row = await this.repository.updateStatus(id, command.status);
    return toRoleDto(row);
  }
}
