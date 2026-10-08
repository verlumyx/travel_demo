import type { RoleRepository } from '../repositories/role.repository';
import { toRoleDto } from '../serializers/role.serializer';

export class RoleFindService {
  constructor(private readonly repository: RoleRepository) {}

  async execute(id: string) {
    const row = await this.repository.findOrFail(id);
    return toRoleDto(row);
  }
}
