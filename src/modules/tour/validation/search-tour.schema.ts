import { z } from 'zod';

export const searchTourSchema = z.object({
  q: z.string().optional(),
  name: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchTourInput = z.infer<typeof searchTourSchema>;
