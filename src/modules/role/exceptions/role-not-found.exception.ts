import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class RoleNotFoundException extends DomainError {
  constructor(id: string) {
    super('Role not found', 'ROLE_NOT_FOUND', { id });
  }
}
