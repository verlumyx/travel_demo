import { z } from 'zod';

export const updateStatusPaymentMethodSchema = z.object({
  status: z.enum(['active', 'inactive'], { message: 'El estado debe ser active o inactive.' }),
});

export type UpdateStatusPaymentMethodInput = z.infer<typeof updateStatusPaymentMethodSchema>;
