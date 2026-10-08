'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createCustomerSchema } from '@/modules/customer/validation/create-customer.schema';
import { updateCustomerSchema } from '@/modules/customer/validation/update-customer.schema';
import { updateStatusCustomerSchema } from '@/modules/customer/validation/update-status-customer.schema';
import { CreateCustomerCommand } from '@/modules/customer/commands/create-customer.command';
import { UpdateCustomerCommand } from '@/modules/customer/commands/update-customer.command';
import { UpdateStatusCustomerCommand } from '@/modules/customer/commands/update-status-customer.command';
import { createCustomerContainer } from '@/modules/customer/container';
import { customerRoutes } from '@/modules/customer/routes';

const uuidSchema = z.string().uuid();

export async function createCustomerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    await requirePermission('customers.create');

    const rawData = {
      id: formData.get('id'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
      documentType: formData.get('documentType') || null,
      documentNumber: formData.get('documentNumber') || null,
      birthDate: formData.get('birthDate') || null,
      emergencyContact: formData.get('emergencyContact') || null,
      emergencyPhone: formData.get('emergencyPhone') || null,
      notes: formData.get('notes') || null,
      source: formData.get('source') || 'admin',
      supabaseUserId: formData.get('supabaseUserId') || null,
    };

    const parsed = createCustomerSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateCustomerCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createCustomerContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(customerRoutes.list());
  await setFlash('success', 'Cliente registrado exitosamente.');
  redirect(customerRoutes.show(createdId!));
}

export async function updateCustomerAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('customers.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de cliente inválido.' };
    }

    const rawData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
      documentType: formData.get('documentType') || null,
      documentNumber: formData.get('documentNumber') || null,
      birthDate: formData.get('birthDate') || null,
      emergencyContact: formData.get('emergencyContact') || null,
      emergencyPhone: formData.get('emergencyPhone') || null,
      notes: formData.get('notes') || null,
      source: formData.get('source') || 'admin',
    };

    const parsed = updateCustomerSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateCustomerCommand.fromInput(id, parsed.data);

    await db.transaction(async (tx) => {
      const container = createCustomerContainer(tx);
      await container.updateService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(customerRoutes.list());
  revalidatePath(customerRoutes.show(id));
  await setFlash('success', 'Cliente actualizado exitosamente.');
  redirect(customerRoutes.show(id));
}

export async function updateCustomerStatusAction(
  id: string,
  status: 'active' | 'inactive',
): Promise<ActionState> {
  try {
    await requirePermission('customers.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de cliente inválido.' };
    }

    const parsed = updateStatusCustomerSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    const command = UpdateStatusCustomerCommand.fromInput(id, parsed.data);
    const container = createCustomerContainer(db);
    await container.updateStatusService.execute(command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(customerRoutes.list());
  revalidatePath(customerRoutes.show(id));
  await setFlash('success', `Cliente marcado como ${status === 'active' ? 'activo' : 'inactivo'}.`);
  return { status: 'idle' };
}
