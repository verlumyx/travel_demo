import { z } from 'zod';

export const searchPaymentSchema = z.object({
  q: z.string().optional(),
  bookingId: z.string().uuid().optional(),
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0)
});
