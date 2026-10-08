import { z } from 'zod';

export const searchDepartureUnitSchema = z.object({
  departureId: z.string().uuid().optional(),
  transportUnitId: z.string().uuid().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});
