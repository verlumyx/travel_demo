'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createDepartureSchema } from '@/modules/departure/validation/create-departure.schema';
import { updateDepartureSchema } from '@/modules/departure/validation/update-departure.schema';
import { updateStatusDepartureSchema } from '@/modules/departure/validation/update-status-departure.schema';
import { createDepartureUnitSchema } from '@/modules/departure-unit/validation/create-departure-unit.schema';
import { updateDepartureUnitSchema } from '@/modules/departure-unit/validation/update-departure-unit.schema';
import { CreateDepartureCommand } from '@/modules/departure/commands/create-departure.command';
import { UpdateDepartureCommand } from '@/modules/departure/commands/update-departure.command';
import { UpdateStatusDepartureCommand } from '@/modules/departure/commands/update-status-departure.command';
import { CreateDepartureUnitCommand } from '@/modules/departure-unit/commands/create-departure-unit.command';
import { UpdateDepartureUnitCommand } from '@/modules/departure-unit/commands/update-departure-unit.command';
import { createDepartureContainer } from '@/modules/departure/container';
import { createDepartureUnitContainer } from '@/modules/departure-unit/container';
import { departureRoutes } from '@/modules/departure/routes';
import type { DepartureRow } from '@/modules/departure/models/departure.model';

const uuidSchema = z.string().uuid();

export async function createDepartureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    await requirePermission('departures.create');

    const rawData = {
      id: formData.get('id'),
      tourId: formData.get('tourId'),
      departureDate: formData.get('departureDate'),
      returnDate: formData.get('returnDate') || null,
      meetingPoint: formData.get('meetingPoint') || null,
      meetingTime: formData.get('meetingTime') || null,
      priceOverride: formData.get('priceOverride') || null,
      totalCapacity: formData.get('totalCapacity') || 0,
      notes: formData.get('notes') || null,
    };

    const parsed = createDepartureSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateDepartureCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createDepartureContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(departureRoutes.list());
  await setFlash('success', 'Salida programada creada exitosamente.');
  redirect(departureRoutes.show(createdId!));
}

export async function updateDepartureAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('departures.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de salida inválido.' };
    }

    const rawData = {
      tourId: formData.get('tourId'),
      departureDate: formData.get('departureDate'),
      returnDate: formData.get('returnDate') || null,
      meetingPoint: formData.get('meetingPoint') || null,
      meetingTime: formData.get('meetingTime') || null,
      priceOverride: formData.get('priceOverride') || null,
      notes: formData.get('notes') || null,
    };

    const parsed = updateDepartureSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateDepartureCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createDepartureContainer(tx);
      await container.updateService.execute(id, command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(departureRoutes.list());
  revalidatePath(departureRoutes.show(id));
  await setFlash('success', 'Salida actualizada exitosamente.');
  redirect(departureRoutes.show(id));
}

export async function updateDepartureStatusAction(
  id: string,
  status: DepartureRow['status'],
): Promise<ActionState> {
  try {
    await requirePermission('departures.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de salida inválido.' };
    }

    const parsed = updateStatusDepartureSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado de salida inválido.' };
    }

    const command = UpdateStatusDepartureCommand.fromInput(id, parsed.data);
    const container = createDepartureContainer(db);
    await container.updateStatusService.execute(id, command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(departureRoutes.list());
  revalidatePath(departureRoutes.show(id));
  await setFlash('success', `Estado de la salida actualizado a ${status}.`);
  return { status: 'idle' };
}

export async function assignDepartureUnitAction(
  departureId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('departure-units.create');

    if (!uuidSchema.safeParse(departureId).success) {
      return { status: 'error', message: 'ID de salida inválido.' };
    }

    const rawData = {
      departureId,
      transportUnitId: formData.get('transportUnitId'),
      assignedCapacity: formData.get('assignedCapacity'),
      driverNameOverride: formData.get('driverNameOverride') || null,
      driverPhoneOverride: formData.get('driverPhoneOverride') || null,
      notes: formData.get('notes') || null,
    };

    const parsed = createDepartureUnitSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateDepartureUnitCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createDepartureUnitContainer(tx);
      await container.createService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(departureRoutes.list());
  revalidatePath(departureRoutes.show(departureId));
  await setFlash('success', 'Unidad de transporte asignada exitosamente.');
  return { status: 'idle' };
}

export async function updateDepartureUnitAction(
  departureUnitId: string,
  departureId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('departure-units.update');

    if (!uuidSchema.safeParse(departureUnitId).success) {
      return { status: 'error', message: 'ID de asignación inválido.' };
    }

    const rawData = {
      assignedCapacity: formData.get('assignedCapacity'),
      driverNameOverride: formData.get('driverNameOverride') || null,
      driverPhoneOverride: formData.get('driverPhoneOverride') || null,
      notes: formData.get('notes') || null,
    };

    const parsed = updateDepartureUnitSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateDepartureUnitCommand.fromInput(departureUnitId, parsed.data);

    await db.transaction(async (tx) => {
      const container = createDepartureUnitContainer(tx);
      await container.updateService.execute(departureUnitId, command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(departureRoutes.list());
  revalidatePath(departureRoutes.show(departureId));
  await setFlash('success', 'Asignación de unidad actualizada exitosamente.');
  return { status: 'idle' };
}

export async function unassignDepartureUnitAction(
  departureUnitId: string,
  departureId: string,
): Promise<ActionState> {
  try {
    await requirePermission('departure-units.update-status');

    if (!uuidSchema.safeParse(departureUnitId).success) {
      return { status: 'error', message: 'ID de asignación inválido.' };
    }

    await db.transaction(async (tx) => {
      const container = createDepartureUnitContainer(tx);
      await container.unassignService.execute(departureUnitId);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(departureRoutes.list());
  revalidatePath(departureRoutes.show(departureId));
  await setFlash('success', 'Unidad desvinculada de la salida exitosamente.');
  return { status: 'idle' };
}
