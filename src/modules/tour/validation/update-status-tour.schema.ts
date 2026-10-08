import { z } from 'zod';

export const updateStatusTourSchema = z.object({
  status: z.enum(['draft', 'active', 'inactive']),
});
