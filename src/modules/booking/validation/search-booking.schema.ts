import { z } from 'zod';

export const searchBookingSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'partial_payment', 'paid', 'cancelled']).optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0)
});
