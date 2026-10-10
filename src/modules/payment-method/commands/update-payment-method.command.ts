import type { UpdatePaymentMethodInput } from '../validation/update-payment-method.schema';

export class UpdatePaymentMethodCommand {
  constructor(
    public readonly name: string,
    public readonly currency: string,
    public readonly instructions: string,
  ) {}

  static fromInput(input: UpdatePaymentMethodInput): UpdatePaymentMethodCommand {
    return new UpdatePaymentMethodCommand(
      input.name,
      input.currency,
      input.instructions,
    );
  }
}
