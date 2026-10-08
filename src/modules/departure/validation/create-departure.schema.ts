import { z } from 'zod';

export const createDepartureSchema = z.object({
  id: z.string({ required_error: 'El ID es requerido' }).uuid('ID inválido'),
  tourId: z.string({ required_error: 'El tour es requerido' }).uuid('ID de tour inválido'),
  departureDate: z.string({ required_error: 'La fecha de salida es requerida' }).datetime('Fecha inválida'),
  returnDate: z.string().datetime('Fecha inválida').optional().nullable(),
  meetingPoint: z.string().max(255).optional().nullable(),
  meetingTime: z.string().max(10).optional().nullable(),
  priceOverride: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  totalCapacity: z.number({ required_error: 'La capacidad es requerida' }).int().min(1),
  notes: z.string().optional().nullable(),
});
