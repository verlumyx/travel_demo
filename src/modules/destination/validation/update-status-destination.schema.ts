import { z } from 'zod';

export const updateStatusDestinationSchema = z.object({
  status: z.enum(['active', 'inactive']),
});
