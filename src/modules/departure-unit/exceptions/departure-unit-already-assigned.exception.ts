import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class DepartureUnitAlreadyAssignedException extends DomainError {
  constructor(message = 'Esta unidad de transporte ya está asignada a la salida.') {
    super(message, 'DEPARTURE_UNIT_ALREADY_ASSIGNED');
    this.name = 'DepartureUnitAlreadyAssignedException';
  }
}
