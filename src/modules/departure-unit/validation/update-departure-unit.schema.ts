import { z } from 'zod';

export const updateDepartureUnitSchema = z.object({
  assignedCapacity: z.coerce.number().int().min(1, { message: 'La capacidad asignada debe ser al menos 1.' }),
  driverNameOverride: z.string().max(255).optional().nullable().or(z.literal('')),
  driverPhoneOverride: z.string().max(50).optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
});

export type UpdateDepartureUnitInput = z.infer<typeof updateDepartureUnitSchema>;
