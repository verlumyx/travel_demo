import { z } from 'zod';

export const updateBookingSchema = z.object({
  notes: z.string().nullable().optional(),
});
