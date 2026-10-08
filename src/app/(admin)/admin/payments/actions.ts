'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission, getSessionUser } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createPaymentSchema } from '@/modules/payment/validation/create-payment.schema';
import { updatePaymentSchema } from '@/modules/payment/validation/update-payment.schema';
import { CreatePaymentCommand } from '@/modules/payment/commands/create-payment.command';
import { UpdatePaymentCommand } from '@/modules/payment/commands/update-payment.command';
import { createPaymentContainer } from '@/modules/payment/container';
import { paymentRoutes } from '@/modules/payment/routes';
import { bookingRoutes } from '@/modules/booking/routes';

const uuidSchema = z.string().uuid();

export async function createPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;
  let bookingIdToRevalidate: string | null = null;

  try {
    await requirePermission('payments.create');
    const user = await getSessionUser();

    const rawId = formData.get('id') || crypto.randomUUID();
    const rawStatus = (formData.get('status') as string) || 'pending';

    const rawData = {
      id: rawId,
      bookingId: formData.get('bookingId'),
      method: formData.get('method'),
      amount: formData.get('amount'),
      currency: formData.get('currency') || 'USD',
      paymentDate: formData.get('paymentDate') || new Date().toISOString(),
      reference: formData.get('reference') || null,
      proofImageUrl: formData.get('proofImageUrl') || null,
      receivedByName: formData.get('receivedByName') || null,
      verifiedById: rawStatus === 'verified' ? user?.id : null,
      verifiedAt: rawStatus === 'verified' ? new Date() : null,
      notes: formData.get('notes') || null,
      status: rawStatus,
    };

    bookingIdToRevalidate = String(rawData.bookingId);

    const parsed = createPaymentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreatePaymentCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createPaymentContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentRoutes.list());
  if (bookingIdToRevalidate) {
    revalidatePath(bookingRoutes.show(bookingIdToRevalidate));
  }
  await setFlash('success', 'Pago o abono registrado exitosamente.');
  redirect(paymentRoutes.show(createdId!));
}

export async function verifyPaymentAction(paymentId: string): Promise<ActionState> {
  let bookingId: string | null = null;

  try {
    await requirePermission('payments.update-status');

    if (!uuidSchema.safeParse(paymentId).success) {
      return { status: 'error', message: 'ID de pago inválido.' };
    }

    const user = await getSessionUser();
    const verifiedById = user?.id || crypto.randomUUID();

    await db.transaction(async (tx) => {
      const container = createPaymentContainer(tx);
      const row = await container.repository.verify(paymentId, verifiedById);
      bookingId = row.bookingId;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentRoutes.list());
  revalidatePath(paymentRoutes.show(paymentId));
  if (bookingId) {
    revalidatePath(bookingRoutes.show(bookingId));
  }
  await setFlash('success', 'Pago verificado correctamente y saldo conciliado.');
  return { status: 'idle' };
}

export async function rejectPaymentAction(paymentId: string): Promise<ActionState> {
  let bookingId: string | null = null;

  try {
    await requirePermission('payments.update-status');

    if (!uuidSchema.safeParse(paymentId).success) {
      return { status: 'error', message: 'ID de pago inválido.' };
    }

    const user = await getSessionUser();
    const verifiedById = user?.id || crypto.randomUUID();

    await db.transaction(async (tx) => {
      const container = createPaymentContainer(tx);
      const row = await container.repository.reject(paymentId, verifiedById);
      bookingId = row.bookingId;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentRoutes.list());
  revalidatePath(paymentRoutes.show(paymentId));
  if (bookingId) {
    revalidatePath(bookingRoutes.show(bookingId));
  }
  await setFlash('success', 'El pago ha sido marcado como rechazado.');
  return { status: 'idle' };
}

export async function updatePaymentAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('payments.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de pago inválido.' };
    }

    const rawData = {
      bookingId: formData.get('bookingId'),
      method: formData.get('method'),
      amount: formData.get('amount'),
      currency: formData.get('currency') || 'USD',
      paymentDate: formData.get('paymentDate'),
      reference: formData.get('reference') || null,
      proofImageUrl: formData.get('proofImageUrl') || null,
      receivedByName: formData.get('receivedByName') || null,
      notes: formData.get('notes') || null,
    };

    const parsed = updatePaymentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdatePaymentCommand.fromInput(id, parsed.data);

    await db.transaction(async (tx) => {
      const container = createPaymentContainer(tx);
      await container.updateService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentRoutes.list());
  revalidatePath(paymentRoutes.show(id));
  await setFlash('success', 'Información de pago actualizada.');
  redirect(paymentRoutes.show(id));
}
