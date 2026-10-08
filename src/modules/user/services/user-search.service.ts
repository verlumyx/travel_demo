import type { UserRepository } from '../repositories/user.repository';
import type { SearchUserCommand } from '../commands/search-user.command';
import { toUserDto } from '../serializers/user.serializer';

export class UserSearchService {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: SearchUserCommand) {
    const { data, total } = await this.repository.search(command);
    return { data: data.map(toUserDto), total };
  }
}
