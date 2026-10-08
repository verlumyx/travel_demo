import { z } from 'zod';

export const createDepartureUnitSchema = z.object({
  departureId: z.string().uuid('ID inválido'),
  transportUnitId: z.string().uuid('ID inválido'),
  assignedCapacity: z.number().int().min(1),
  driverNameOverride: z.string().max(255).optional().nullable(),
  driverPhoneOverride: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateDepartureUnitInput = z.infer<typeof createDepartureUnitSchema>;
