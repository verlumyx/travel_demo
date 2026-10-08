import type { UserRepository } from '../repositories/user.repository';
import type { CreateUserCommand } from '../commands/create-user.command';
import { toUserDto } from '../serializers/user.serializer';

export class UserCreateService {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: CreateUserCommand) {
    const row = await this.repository.create(command);
    return toUserDto(row);
  }
}
