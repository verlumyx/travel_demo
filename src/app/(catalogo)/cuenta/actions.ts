'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAuthenticatedCustomer } from '@/modules/customer/auth/customer-session';
import { createBookingContainer } from '@/modules/booking/container';
import { createPaymentContainer } from '@/modules/payment/container';
import { CreatePaymentCommand } from '@/modules/payment/commands/create-payment.command';
import { createCustomerContainer } from '@/modules/customer/container';
import { UpdateCustomerCommand } from '@/modules/customer/commands/update-customer.command';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio.').max(255),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio.').max(255),
  phone: z.string().trim().min(1, 'El teléfono / WhatsApp de contacto es obligatorio.').max(50, 'El teléfono no puede superar 50 caracteres.'),
  documentType: z.enum(['cedula', 'passport', 'other']).optional().or(z.literal('')),
  documentNumber: z.string().trim().max(50).optional().or(z.literal('')),
  birthDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Fecha de nacimiento inválida.',
    })
    .or(z.literal('')),
  emergencyContact: z.string().trim().max(255).optional().or(z.literal('')),
  emergencyPhone: z.string().trim().max(50).optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
});

const reportPaymentSchema = z.object({
  bookingId: z.string().uuid({ message: 'Reserva no válida.' }),
  method: z.enum([
    'pago_movil',
    'zelle',
    'binance',
    'zinli',
    'bank_transfer',
    'cash_usd',
    'cash_ves',
  ]),
  amount: z
    .string()
    .min(1, 'El monto es obligatorio.')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido. Ejemplo: 50.00'),
  reference: z.string().min(2, 'Indique el número de referencia del comprobante.'),
  proofImageUrl: z.string().url('Debe ser una URL válida de comprobante o captura.').optional().or(z.literal('')),
  notes: z.string().optional(),
});

import { cookies } from 'next/headers';

export async function customerLogoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete('demo_customer_email');
  redirect('/cuenta/login');
}

export async function customerReportPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let bookingId: string | null = null;

  try {
    const session = await getAuthenticatedCustomer();
    if (!session) {
      return { status: 'error', message: 'Debe iniciar sesión para reportar un pago.' };
    }

    const rawData = {
      bookingId: formData.get('bookingId'),
      method: formData.get('method'),
      amount: formData.get('amount'),
      reference: formData.get('reference'),
      proofImageUrl: formData.get('proofImageUrl') || '',
      notes: formData.get('notes') || '',
    };

    const parsed = reportPaymentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    bookingId = parsed.data.bookingId;

    // Verify booking belongs to this customer
    const bookingContainer = createBookingContainer();
    const booking = await bookingContainer.repository.findById(bookingId);

    if (!booking || booking.customerId !== session.customer.id) {
      return { status: 'error', message: 'La reserva no fue encontrada o no pertenece a su cuenta.' };
    }

    if (booking.status === 'cancelled') {
      return { status: 'error', message: 'No puede reportar pagos sobre una reserva cancelada.' };
    }

    const paymentId = crypto.randomUUID();
    const command = CreatePaymentCommand.fromInput({
      id: paymentId,
      bookingId,
      method: parsed.data.method,
      amount: parsed.data.amount,
      currency: 'USD',
      paymentDate: new Date(),
      reference: parsed.data.reference,
      proofImageUrl: parsed.data.proofImageUrl || undefined,
      receivedByName: 'Reportado por cliente en portal',
      notes: parsed.data.notes || 'Comprobante cargado por el pasajero desde el área de cuenta.',
      status: 'pending',
    });

    await db.transaction(async (tx) => {
      const paymentContainer = createPaymentContainer(tx);
      await paymentContainer.createService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath('/cuenta/reservas');
  if (bookingId) {
    revalidatePath(`/cuenta/reservas/${bookingId}`);
  }
  await setFlash('success', '¡Comprobante recibido con éxito! Nuestro equipo lo validará para acreditar tu saldo.');
  return { status: 'idle', message: 'Pago reportado exitosamente.' };
}

export async function customerUpdateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await getAuthenticatedCustomer();
    if (!session) {
      return { status: 'error', message: 'Debe iniciar sesión para actualizar su perfil.' };
    }

    const rawData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone') || '',
      documentType: formData.get('documentType') || '',
      documentNumber: formData.get('documentNumber') || '',
      birthDate: formData.get('birthDate') || '',
      emergencyContact: formData.get('emergencyContact') || '',
      emergencyPhone: formData.get('emergencyPhone') || '',
      notes: formData.get('notes') || '',
    };

    const parsed = updateProfileSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const customerContainer = createCustomerContainer();
    const command = UpdateCustomerCommand.fromInput(session.customer.id, {
      ...parsed.data,
      email: session.customer.email,
      source: session.customer.source,
    });

    await customerContainer.updateService.execute(command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath('/cuenta/perfil');
  revalidatePath('/cuenta/reservas');
  await setFlash('success', '¡Tus datos de viajero han sido actualizados con éxito!');
  return { status: 'idle', message: 'Perfil actualizado exitosamente.' };
}

/** Demo login helper when Supabase Auth credentials are in dev placeholder mode */
export async function customerDemoLoginAction(email: string): Promise<void> {
  const customerContainer = createCustomerContainer();
  const customer = await customerContainer.repository.findByEmail(email);

  if (!customer) {
    throw new Error('Cliente demo no encontrado en el sistema.');
  }

  // We set a lightweight dev cookie so session works seamlessly
  const supabase = await createSupabaseServerClient();
  const dummyUserId = customer.supabaseUserId || `dev_user_${customer.id}`;

  if (!customer.supabaseUserId) {
    await customerContainer.repository.linkSupabaseUser(customer.id, dummyUserId);
  }

  const cookieStore = await cookies();
  cookieStore.set('demo_customer_email', customer.email!, {
    path: '/',
    httpOnly: true,
    maxAge: 86400 * 7,
  });

  // In test/demo environment, redirect directly
  redirect('/cuenta/reservas');
}
