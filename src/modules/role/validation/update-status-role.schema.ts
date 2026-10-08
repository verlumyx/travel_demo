import { z } from 'zod';

export const updateStatusRoleSchema = z.object({
  status: z.enum(['active', 'inactive']),
});
