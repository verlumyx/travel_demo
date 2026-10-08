import { z } from 'zod';

export const createCustomerSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  firstName: z.string().min(1, { message: 'El nombre es obligatorio.' }).max(255),
  lastName: z.string().min(1, { message: 'El apellido es obligatorio.' }).max(255),
  email: z.string().email({ message: 'El correo electrónico no es válido.' }).max(255).optional(),
  phone: z.string().max(50).optional(),
  documentType: z.enum(['cedula', 'passport', 'other']).optional(),
  documentNumber: z.string().max(50).optional(),
  birthDate: z.coerce.date().optional(),
  emergencyContact: z.string().max(255).optional(),
  emergencyPhone: z.string().max(50).optional(),
  notes: z.string().optional(),
  source: z.enum(['admin', 'portal', 'whatsapp', 'instagram']).optional(),
  supabaseUserId: z.string().max(255).optional()
});
