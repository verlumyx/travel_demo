import { z } from 'zod';

export const createItineraryStopSchema = z.object({
  tourId: z.string({ required_error: 'El tour es requerido' }).uuid('ID de tour inválido'),
  destinationId: z.string({ required_error: 'El destino es requerido' }).uuid('ID de destino inválido'),
  dayNumber: z.number({ required_error: 'El número de día es requerido' }).int('Debe ser entero').min(1, 'Debe ser al menos 1'),
  sortOrder: z.number({ required_error: 'El orden es requerido' }).int('Debe ser entero').min(0, 'Debe ser al menos 0'),
  title: z.string({ required_error: 'El título es requerido' }).max(255, 'Máximo 255 caracteres'),
  description: z.string().optional().nullable(),
  overnightStay: z.boolean().default(false),
});
