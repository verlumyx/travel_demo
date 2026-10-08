import { z } from 'zod';

export const updateCategorySchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  slug: z.string().min(2, { message: 'El slug debe tener al menos 2 caracteres.' }).max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'El slug solo puede contener letras minúsculas, números y guiones.' }),
  description: z.string().optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  imageUrl: z.string().url({ message: 'URL de imagen no válida' }).max(500).optional().nullable().or(z.literal('')),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
