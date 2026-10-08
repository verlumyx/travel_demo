import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class TourNotFoundException extends DomainError {
  constructor(id: string) {
    super('Tour not found', 'TOUR_NOT_FOUND', { id });
  }
}
