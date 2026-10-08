import type { UserRepository } from '../repositories/user.repository';
import type { UpdateUserCommand } from '../commands/update-user.command';
import { toUserDto } from '../serializers/user.serializer';

export class UserUpdateService {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string, command: UpdateUserCommand) {
    const row = await this.repository.update(id, command);
    return toUserDto(row);
  }
}
