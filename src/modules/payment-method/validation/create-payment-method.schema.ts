import { z } from 'zod';

export const createPaymentMethodSchema = z.object({
  id: z.string().uuid({ message: 'El identificador debe ser un UUID válido.' }),
  name: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }).max(150),
  currency: z.string().trim().min(2, { message: 'Indique una moneda válida.' }).max(10).default('USD'),
  instructions: z.string().trim().min(5, { message: 'Las instrucciones y coordenadas de pago deben tener al menos 5 caracteres.' }),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
