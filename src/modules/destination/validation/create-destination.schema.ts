import { z } from 'zod';

export const createDestinationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default('Venezuela'),
  status: z.enum(['active', 'inactive']).default('active'),
});
