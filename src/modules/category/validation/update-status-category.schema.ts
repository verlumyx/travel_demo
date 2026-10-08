import { z } from 'zod';

export const updateStatusCategorySchema = z.object({
  status: z.enum(['active', 'inactive'], { message: 'El estado debe ser activo o inactivo.' }),
});

export type UpdateStatusCategoryInput = z.infer<typeof updateStatusCategorySchema>;
