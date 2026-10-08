import { z } from 'zod';

export const createRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Requerido').max(100),
  description: z.string().max(255).optional().nullable(),
  permissionType: z.enum(['all', 'custom']).default('custom'),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});
