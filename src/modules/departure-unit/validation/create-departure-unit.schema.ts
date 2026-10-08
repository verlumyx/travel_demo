import { z } from 'zod';

export const createDepartureUnitSchema = z.object({
  departureId: z.string({ required_error: 'La salida es requerida' }).uuid('ID inválido'),
  transportUnitId: z.string({ required_error: 'La unidad es requerida' }).uuid('ID inválido'),
  assignedCapacity: z.number({ required_error: 'La capacidad es requerida' }).int().min(1),
  driverNameOverride: z.string().max(255).optional().nullable(),
  driverPhoneOverride: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});
