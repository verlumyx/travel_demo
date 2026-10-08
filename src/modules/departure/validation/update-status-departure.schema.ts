import { z } from 'zod';

export const updateStatusDepartureSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});

export type UpdateStatusDepartureInput = z.infer<typeof updateStatusDepartureSchema>;
