import { z } from 'zod';

export const passengerItemSchema = z.object({
  firstName: z.string().min(1, 'El nombre del pasajero es obligatorio.').max(255),
  lastName: z.string().min(1, 'El apellido del pasajero es obligatorio.').max(255),
  documentType: z.enum(['cedula', 'passport', 'other']).optional().nullable().or(z.literal('')),
  documentNumber: z.string().max(50).optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable().or(z.literal('')),
  isMainContact: z.coerce.boolean().default(false),
  notes: z.string().optional().nullable().or(z.literal('')),
});

export const createBookingSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  departureId: z.string().uuid({ message: 'Debe seleccionar una salida válida.' }),
  customerId: z.string().uuid({ message: 'Debe seleccionar un cliente válido.' }),
  slotsReserved: z.coerce.number().int().min(1, 'Debe reservar al menos 1 cupo.'),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto total inválido (ej: 150.00)'),
  paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable().default('0'),
  notes: z.string().optional().nullable().or(z.literal('')),
  source: z.enum(['admin', 'portal']).default('admin'),
  createdById: z.string().uuid().optional().nullable(),
  passengers: z.array(passengerItemSchema).min(1, 'Debe registrar al menos un pasajero.'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
