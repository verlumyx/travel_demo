import { z } from 'zod';

export const createCustomerSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  firstName: z.string().min(1, { message: 'El nombre es obligatorio.' }).max(255),
  lastName: z.string().min(1, { message: 'El apellido es obligatorio.' }).max(255),
  email: z
    .string({ message: 'El correo electrónico es obligatorio.' })
    .trim()
    .min(1, { message: 'El correo electrónico es obligatorio.' })
    .email({ message: 'Correo electrónico no válido.' })
    .max(255),
  phone: z
    .string({ message: 'El teléfono / WhatsApp es obligatorio.' })
    .trim()
    .min(1, { message: 'El teléfono / WhatsApp es obligatorio.' })
    .max(50, { message: 'El teléfono no puede superar 50 caracteres.' }),
  documentType: z.enum(['cedula', 'passport', 'other'], {
    message: 'El tipo de documento es obligatorio.',
  }),
  documentNumber: z
    .string({ message: 'El número de documento es obligatorio.' })
    .trim()
    .min(1, { message: 'El número de documento es obligatorio.' })
    .max(50, { message: 'El número de documento no puede superar 50 caracteres.' }),
  birthDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Fecha de nacimiento inválida.',
    })
    .or(z.literal('')),
  emergencyContact: z.string().max(255).optional().nullable().or(z.literal('')),
  emergencyPhone: z.string().max(50).optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
  source: z.enum(['admin', 'portal', 'whatsapp', 'instagram']).default('admin'),
  supabaseUserId: z.string().max(255).optional().nullable().or(z.literal('')),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
