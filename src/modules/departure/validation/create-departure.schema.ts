import { z } from 'zod';

export const createDepartureSchema = z.object({
  id: z.string().uuid('ID inválido'),
  tourId: z.string().uuid('ID de tour inválido'),
  departureDate: z.string().datetime('Fecha inválida'),
  returnDate: z.string().datetime('Fecha inválida').optional().nullable(),
  meetingPoint: z.string().max(255).optional().nullable(),
  meetingTime: z.string().max(10).optional().nullable(),
  priceOverride: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  totalCapacity: z.number().int().min(1),
  notes: z.string().optional().nullable(),
});

export type CreateDepartureInput = z.infer<typeof createDepartureSchema>;
