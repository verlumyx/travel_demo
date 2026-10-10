'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createPaymentMethodSchema } from '@/modules/payment-method/validation/create-payment-method.schema';
import { updatePaymentMethodSchema } from '@/modules/payment-method/validation/update-payment-method.schema';
import { updateStatusPaymentMethodSchema } from '@/modules/payment-method/validation/update-status-payment-method.schema';
import { CreatePaymentMethodCommand } from '@/modules/payment-method/commands/create-payment-method.command';
import { UpdatePaymentMethodCommand } from '@/modules/payment-method/commands/update-payment-method.command';
import { UpdateStatusPaymentMethodCommand } from '@/modules/payment-method/commands/update-status-payment-method.command';
import { createPaymentMethodContainer } from '@/modules/payment-method/container';
import { paymentMethodRoutes } from '@/modules/payment-method/routes';

const uuidSchema = z.string().uuid();

export async function createPaymentMethodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('payment-methods.create');

    const rawData = {
      id: formData.get('id'),
      name: formData.get('name'),
      currency: formData.get('currency'),
      instructions: formData.get('instructions'),
    };

    const parsed = createPaymentMethodSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreatePaymentMethodCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createPaymentMethodContainer(tx);
      await container.createService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentMethodRoutes.list());
  await setFlash('success', 'Método de pago creado exitosamente.');
  redirect(paymentMethodRoutes.list());
}

export async function updatePaymentMethodAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('payment-methods.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de método de pago inválido.' };
    }

    const rawData = {
      name: formData.get('name'),
      currency: formData.get('currency'),
      instructions: formData.get('instructions'),
    };

    const parsed = updatePaymentMethodSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdatePaymentMethodCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createPaymentMethodContainer(tx);
      await container.updateService.execute(id, command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentMethodRoutes.list());
  revalidatePath(paymentMethodRoutes.show(id));
  await setFlash('success', 'Método de pago actualizado exitosamente.');
  redirect(paymentMethodRoutes.list());
}

export async function updatePaymentMethodStatusAction(
  id: string,
  status: 'active' | 'inactive',
): Promise<ActionState> {
  try {
    await requirePermission('payment-methods.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de método de pago inválido.' };
    }

    const parsed = updateStatusPaymentMethodSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    const command = UpdateStatusPaymentMethodCommand.fromInput(parsed.data);
    const container = createPaymentMethodContainer(db);
    await container.updateStatusService.execute(id, command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentMethodRoutes.list());
  revalidatePath(paymentMethodRoutes.show(id));
  await setFlash(
    'success',
    `Método de pago ${status === 'active' ? 'activado' : 'desactivado'} correctamente.`,
  );
  return { status: 'idle' };
}
