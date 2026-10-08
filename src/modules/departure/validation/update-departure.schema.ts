import { z } from 'zod';
import { createDepartureSchema } from './create-departure.schema';

export const updateDepartureSchema = createDepartureSchema.omit({ id: true });
