import { z } from 'zod';

export const searchCategorySchema = z.object({
  q: z.string().optional(),
  code: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchCategoryInput = z.infer<typeof searchCategorySchema>;
