import { z } from 'zod';

export const updateStatusCustomerSchema = z.object({
  status: z.enum(['active', 'inactive'], { message: 'Estado inválido.' })
});
