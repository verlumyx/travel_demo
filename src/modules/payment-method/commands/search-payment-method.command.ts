import type { SearchPaymentMethodInput } from '../validation/search-payment-method.schema';

export class SearchPaymentMethodCommand {
  constructor(
    public readonly filters: {
      q?: string;
      code?: string;
      currency?: string;
      status?: 'active' | 'inactive';
    },
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}

  static fromInput(input: SearchPaymentMethodInput): SearchPaymentMethodCommand {
    return new SearchPaymentMethodCommand(
      {
        q: input.q,
        code: input.code,
        currency: input.currency,
        status: input.status,
      },
      input.limit,
      input.offset,
    );
  }
}
