import type { CreatePaymentMethodInput } from '../validation/create-payment-method.schema';

export class CreatePaymentMethodCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly currency: string,
    public readonly instructions: string,
  ) {}

  static fromInput(input: CreatePaymentMethodInput): CreatePaymentMethodCommand {
    return new CreatePaymentMethodCommand(
      input.id,
      input.name,
      input.currency,
      input.instructions,
    );
  }
}
