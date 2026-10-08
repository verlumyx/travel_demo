import { z } from 'zod';

export const searchTourSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});
