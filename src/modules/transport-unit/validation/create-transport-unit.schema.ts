import { z } from 'zod';

export const createTransportUnitSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  type: z.enum(['bus', 'minibus', 'van', 'boat', 'other']),
  plateNumber: z.string().max(20).optional().nullable(),
  capacity: z.number().int('Debe ser entero').min(1, 'Debe ser al menos 1'),
  driverName: z.string().max(255).optional().nullable(),
  driverPhone: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateTransportUnitInput = z.infer<typeof createTransportUnitSchema>;
