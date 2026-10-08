import { z } from 'zod';

export const updateBookingSchema = z.object({
  departureId: z.string().uuid(),
  customerId: z.string().uuid(),
  slotsReserved: z.number().int().min(1),
  totalAmount: z.string(),
  paidAmount: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['admin', 'portal']).optional()
});
