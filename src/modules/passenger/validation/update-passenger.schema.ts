import { z } from 'zod';

export const updatePassengerSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  documentType: z.enum(['cedula', 'passport', 'other']).optional(),
  documentNumber: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  isMainContact: z.boolean().optional(),
  notes: z.string().optional()
});
