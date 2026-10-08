import { z } from 'zod';

export const createTourSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  durationDays: z.number().int().min(1).default(1),
  basePrice: z.string().min(1, 'Requerido'),
  currency: z.string().default('USD'),
  includesFood: z.boolean().default(false),
  includesLodging: z.boolean().default(false),
  inclusions: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
});
