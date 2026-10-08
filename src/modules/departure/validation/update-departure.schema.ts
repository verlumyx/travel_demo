import { z } from 'zod';

export const updateDepartureSchema = z.object({
  tourId: z.string().uuid({ message: 'Debe seleccionar un tour válido.' }),
  departureDate: z
    .string()
    .min(1, { message: 'La fecha y hora de salida son obligatorias.' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha de salida inválida.' }),
  returnDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Fecha de retorno inválida.' }),
  meetingPoint: z.string().max(255).optional().nullable().or(z.literal('')),
  meetingTime: z.string().max(10).optional().nullable().or(z.literal('')),
  priceOverride: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: 'Precio inválido (ej: 120.00)' })
    .optional()
    .nullable()
    .or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
});

export type UpdateDepartureInput = z.infer<typeof updateDepartureSchema>;
