import { z } from 'zod';

export const updateStatusTransportUnitSchema = z.object({
  status: z.enum(['active', 'inactive', 'maintenance']),
});

export type UpdateStatusTransportUnitInput = z.infer<typeof updateStatusTransportUnitSchema>;
