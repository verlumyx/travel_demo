import { z } from 'zod';

export const searchItineraryStopSchema = z.object({
  tourId: z.string().uuid().optional(),
  destinationId: z.string().uuid().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});
