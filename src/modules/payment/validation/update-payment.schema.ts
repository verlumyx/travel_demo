import { z } from 'zod';

export const updatePaymentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(['pago_movil', 'zelle', 'binance', 'zinli', 'bank_transfer', 'cash_usd', 'cash_ves']),
  amount: z.string(),
  currency: z.string().optional().default('USD'),
  paymentDate: z.coerce.date(),
  reference: z.string().max(255).optional(),
  proofImageUrl: z.string().max(500).optional(),
  receivedByName: z.string().max(255).optional(),
  verifiedById: z.string().uuid().optional(),
  verifiedAt: z.coerce.date().optional(),
  notes: z.string().optional()
});
