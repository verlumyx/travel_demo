import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6).optional(),
  roleId: z.string().uuid('Rol inválido'),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});
