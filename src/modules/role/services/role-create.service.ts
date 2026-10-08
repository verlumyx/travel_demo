import type { RoleRepository } from '../repositories/role.repository';
import type { CreateRoleCommand } from '../commands/create-role.command';
import { toRoleDto } from '../serializers/role.serializer';

export class RoleCreateService {
  constructor(private readonly repository: RoleRepository) {}

  async execute(command: CreateRoleCommand) {
    const row = await this.repository.create(command);
    return toRoleDto(row);
  }
}
