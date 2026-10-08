import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class ItineraryStopNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Itinerary stop with id ${id} not found`, 'ITINERARY_STOP_NOT_FOUND', 404);
  }
}
