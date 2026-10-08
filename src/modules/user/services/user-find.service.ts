import type { UserRepository } from '../repositories/user.repository';
import { toUserDto } from '../serializers/user.serializer';

export class UserFindService {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string) {
    const row = await this.repository.findOrFail(id);
    return toUserDto(row);
  }
}
