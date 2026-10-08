import { z } from 'zod';

export const createUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  roleId: z.string().uuid('Rol inválido'),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});
