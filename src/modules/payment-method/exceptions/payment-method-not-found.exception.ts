import { NotFoundError } from '@/modules/shared/exceptions/domain-error';

export class PaymentMethodNotFoundException extends NotFoundError {
  constructor(id: string) {
    super(`Método de pago con ID ${id} no encontrado.`);
  }
}
