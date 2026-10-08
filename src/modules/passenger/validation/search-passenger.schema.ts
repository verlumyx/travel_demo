import { z } from 'zod';

export const searchPassengerSchema = z.object({
  bookingId: z.string().uuid().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0)
});
