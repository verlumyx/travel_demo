import { z } from 'zod';

export const updateStatusUserSchema = z.object({
  status: z.enum(['active', 'inactive']),
});
