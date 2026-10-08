import { z } from 'zod';

export const searchCustomerSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0)
});
