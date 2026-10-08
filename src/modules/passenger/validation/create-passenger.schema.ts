import { z } from 'zod';

export const createPassengerSchema = z.object({
  bookingId: z.string().uuid(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  documentType: z.enum(['cedula', 'passport', 'other']).optional(),
  documentNumber: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  isMainContact: z.boolean().optional().default(false),
  notes: z.string().optional()
});
