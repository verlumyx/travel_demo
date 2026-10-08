import { z } from 'zod';

export const updateStatusTransportUnitSchema = z.object({
  status: z.enum(['active', 'inactive', 'maintenance'], { required_error: 'El estado es requerido' }),
});
