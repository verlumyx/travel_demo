import { z } from 'zod';

export const createDestinationSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  categoryId: z.string().uuid({ message: 'Categoría inválida.' }).optional().nullable().or(z.literal('')),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(255),
  slug: z.string().min(2, { message: 'El slug debe tener al menos 2 caracteres.' }).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'El slug solo puede contener letras minúsculas, números y guiones.' }),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url({ message: 'URL de imagen no válida' }).max(500).optional().nullable().or(z.literal('')),
  state: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default('Venezuela'),
});

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
