import { z } from 'zod';

export const updateStatusPaymentSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected'], { message: 'Estado inválido.' })
});
