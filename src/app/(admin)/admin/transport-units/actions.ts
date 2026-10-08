'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createTransportUnitSchema } from '@/modules/transport-unit/validation/create-transport-unit.schema';
import { updateTransportUnitSchema } from '@/modules/transport-unit/validation/update-transport-unit.schema';
import { updateStatusTransportUnitSchema } from '@/modules/transport-unit/validation/update-status-transport-unit.schema';
import { CreateTransportUnitCommand } from '@/modules/transport-unit/commands/create-transport-unit.command';
import { UpdateTransportUnitCommand } from '@/modules/transport-unit/commands/update-transport-unit.command';
import { UpdateStatusTransportUnitCommand } from '@/modules/transport-unit/commands/update-status-transport-unit.command';
import { createTransportUnitContainer } from '@/modules/transport-unit/container';
import { transportUnitRoutes } from '@/modules/transport-unit/routes';

const uuidSchema = z.string().uuid();

export async function createTransportUnitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    await requirePermission('transport-units.create');

    const rawData = {
      id: formData.get('id'),
      name: formData.get('name'),
      type: formData.get('type'),
      plateNumber: formData.get('plateNumber') || null,
      capacity: Number(formData.get('capacity')),
      driverName: formData.get('driverName') || null,
      driverPhone: formData.get('driverPhone') || null,
      notes: formData.get('notes') || null,
    };

    const parsed = createTransportUnitSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateTransportUnitCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createTransportUnitContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(transportUnitRoutes.list());
  await setFlash('success', 'Unidad de transporte registrada exitosamente.');
  redirect(transportUnitRoutes.list());
}

export async function updateTransportUnitAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('transport-units.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de unidad inválido.' };
    }

    const rawData = {
      name: formData.get('name') || undefined,
      type: formData.get('type') || undefined,
      plateNumber: formData.get('plateNumber') || null,
      capacity: formData.get('capacity') ? Number(formData.get('capacity')) : undefined,
      driverName: formData.get('driverName') || null,
      driverPhone: formData.get('driverPhone') || null,
      notes: formData.get('notes') || null,
    };

    const parsed = updateTransportUnitSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateTransportUnitCommand.fromInput(id, parsed.data);

    await db.transaction(async (tx) => {
      const container = createTransportUnitContainer(tx);
      await container.updateService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(transportUnitRoutes.list());
  revalidatePath(transportUnitRoutes.show(id));
  await setFlash('success', 'Unidad de transporte actualizada exitosamente.');
  redirect(transportUnitRoutes.list());
}

export async function updateTransportUnitStatusAction(
  id: string,
  status: 'active' | 'inactive' | 'maintenance',
): Promise<ActionState> {
  try {
    await requirePermission('transport-units.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de unidad inválido.' };
    }

    const parsed = updateStatusTransportUnitSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    const command = UpdateStatusTransportUnitCommand.fromInput(id, parsed.data);
    const container = createTransportUnitContainer(db);
    await container.updateStatusService.execute(command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(transportUnitRoutes.list());
  revalidatePath(transportUnitRoutes.show(id));
  await setFlash('success', `Estado de unidad actualizado a ${status}.`);
  return { status: 'idle' };
}
