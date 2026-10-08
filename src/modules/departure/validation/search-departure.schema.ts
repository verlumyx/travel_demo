import { z } from 'zod';

export const searchDepartureSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  tourId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

export type SearchDepartureInput = z.infer<typeof searchDepartureSchema>;
