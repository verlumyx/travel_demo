import { z } from 'zod';

export const createBookingSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  departureId: z.string().uuid(),
  customerId: z.string().uuid(),
  slotsReserved: z.number().int().min(1),
  totalAmount: z.string(),
  paidAmount: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['admin', 'portal']).optional(),
  createdById: z.string().uuid().optional()
});
