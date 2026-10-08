import { z } from 'zod';

export const updateStatusDepartureSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'], { required_error: 'El estado es requerido' }),
});
