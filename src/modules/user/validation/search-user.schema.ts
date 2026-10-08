import { z } from 'zod';

export const searchUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});
