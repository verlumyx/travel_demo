import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class UserNotFoundException extends DomainError {
  constructor(id: string) {
    super('User not found', 'USER_NOT_FOUND', { id });
  }
}
