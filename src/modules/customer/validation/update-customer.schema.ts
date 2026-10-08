import { z } from 'zod';

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, { message: 'El nombre es obligatorio.' }).max(255),
  lastName: z.string().min(1, { message: 'El apellido es obligatorio.' }).max(255),
  email: z
    .string()
    .email({ message: 'Correo electrónico no válido.' })
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string().max(50).optional().nullable().or(z.literal('')),
  documentType: z
    .enum(['cedula', 'passport', 'other'])
    .optional()
    .nullable()
    .or(z.literal('')),
  documentNumber: z.string().max(50).optional().nullable().or(z.literal('')),
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
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
