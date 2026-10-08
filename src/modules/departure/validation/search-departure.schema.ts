import { z } from 'zod';

export const searchDepartureSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  tourId: z.string().uuid().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});
