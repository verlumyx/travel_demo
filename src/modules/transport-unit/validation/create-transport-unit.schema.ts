import { z } from 'zod';

export const createTransportUnitSchema = z.object({
  id: z.string({ required_error: 'El ID es requerido' }).uuid('ID inválido'),
  name: z.string({ required_error: 'El nombre es requerido' }).max(255, 'Máximo 255 caracteres'),
  type: z.enum(['bus', 'minibus', 'van', 'boat', 'other'], { required_error: 'El tipo es requerido' }),
  plateNumber: z.string().max(20).optional().nullable(),
  capacity: z.number({ required_error: 'La capacidad es requerida' }).int('Debe ser entero').min(1, 'Debe ser al menos 1'),
  driverName: z.string().max(255).optional().nullable(),
  driverPhone: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});
