import type { RoleRepository } from '../repositories/role.repository';
import type { SearchRoleCommand } from '../commands/search-role.command';
import { toRoleDto } from '../serializers/role.serializer';

export class RoleSearchService {
  constructor(private readonly repository: RoleRepository) {}

  async execute(command: SearchRoleCommand) {
    const { data, total } = await this.repository.search(command);
    return { data: data.map(toRoleDto), total };
  }
}
