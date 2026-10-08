import { z } from 'zod';

export const searchDestinationSchema = z.object({
  q: z.string().optional(),
  name: z.string().optional(),
  categoryId: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchDestinationInput = z.infer<typeof searchDestinationSchema>;
