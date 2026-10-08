import { z } from 'zod';

export const updateStatusBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'partial_payment', 'paid', 'cancelled'], { message: 'Estado inválido.' })
});
