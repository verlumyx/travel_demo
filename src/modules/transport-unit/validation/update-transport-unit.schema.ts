import { z } from 'zod';
import { createTransportUnitSchema } from './create-transport-unit.schema';

export const updateTransportUnitSchema = createTransportUnitSchema.omit({ id: true });
