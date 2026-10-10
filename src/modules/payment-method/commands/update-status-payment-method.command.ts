import type { UpdateStatusPaymentMethodInput } from '../validation/update-status-payment-method.schema';

export class UpdateStatusPaymentMethodCommand {
  constructor(public readonly status: 'active' | 'inactive') {}

  static fromInput(input: UpdateStatusPaymentMethodInput): UpdateStatusPaymentMethodCommand {
    return new UpdateStatusPaymentMethodCommand(input.status);
  }
}
