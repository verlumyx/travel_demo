import { z } from 'zod';

export const createPaymentSchema = z.object({
  id: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }),
  bookingId: z.string().uuid({ message: 'Debe seleccionar una reserva válida.' }),
  method: z.enum(
    ['pago_movil', 'zelle', 'binance', 'zinli', 'bank_transfer', 'cash_usd', 'cash_ves'],
    { message: 'Método de pago inválido.' },
  ),
  amount: z
    .string()
    .min(1, 'El monto es requerido.')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido. Ejemplo: 150.00'),
  currency: z.string().optional().default('USD'),
  paymentDate: z.coerce.date(),
  reference: z.string().max(255).nullish(),
  proofImageUrl: z.string().max(500).nullish(),
  receivedByName: z.string().max(255).nullish(),
  verifiedById: z.string().uuid().nullish(),
  verifiedAt: z.coerce.date().nullish(),
  notes: z.string().nullish(),
  status: z.enum(['pending', 'verified', 'rejected']).optional().default('pending'),
});
