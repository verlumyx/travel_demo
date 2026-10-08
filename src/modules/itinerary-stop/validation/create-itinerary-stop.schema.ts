import { z } from 'zod';

export const createItineraryStopSchema = z.object({
  tourId: z.string().uuid('ID de tour inválido'),
  destinationId: z.string().uuid('ID de destino inválido'),
  dayNumber: z.number().int('Debe ser entero').min(1, 'Debe ser al menos 1'),
  sortOrder: z.number().int('Debe ser entero').min(0, 'Debe ser al menos 0'),
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().optional().nullable(),
  overnightStay: z.boolean().default(false),
});

export type CreateItineraryStopInput = z.infer<typeof createItineraryStopSchema>;
