import { z } from 'zod';

export const createTourSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(255),
  slug: z.string().min(2, { message: 'El slug debe tener al menos 2 caracteres.' }).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'El slug solo puede contener minúsculas, números y guiones.' }),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url({ message: 'URL de imagen no válida' }).max(500).optional().nullable().or(z.literal('')),
  durationDays: z.coerce.number().int().min(1, 'La duración mínima es 1 día.').default(1),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Precio base inválido (ej: 150 o 150.00)' }),
  currency: z.string().max(10).default('USD'),
  includesFood: z.coerce.boolean().default(false),
  includesLodging: z.coerce.boolean().default(false),
  inclusions: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
});

export type CreateTourInput = z.infer<typeof createTourSchema>;
