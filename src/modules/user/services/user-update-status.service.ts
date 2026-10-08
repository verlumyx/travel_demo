import type { UserRepository } from '../repositories/user.repository';
import type { UpdateStatusUserCommand } from '../commands/update-status-user.command';
import { toUserDto } from '../serializers/user.serializer';

export class UserUpdateStatusService {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string, command: UpdateStatusUserCommand) {
    const row = await this.repository.updateStatus(id, command.status);
    return toUserDto(row);
  }
}
