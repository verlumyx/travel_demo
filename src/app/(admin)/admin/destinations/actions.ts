'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createDestinationSchema } from '@/modules/destination/validation/create-destination.schema';
import { updateDestinationSchema } from '@/modules/destination/validation/update-destination.schema';
import { updateStatusDestinationSchema } from '@/modules/destination/validation/update-status-destination.schema';
import { CreateDestinationCommand } from '@/modules/destination/commands/create-destination.command';
import { UpdateDestinationCommand } from '@/modules/destination/commands/update-destination.command';
import { UpdateStatusDestinationCommand } from '@/modules/destination/commands/update-status-destination.command';
import { createDestinationContainer } from '@/modules/destination/container';
import { destinationRoutes } from '@/modules/destination/routes';
import { storageService } from '@/modules/shared/services/storage.service';

const uuidSchema = z.string().uuid();

export async function createDestinationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    await requirePermission('destinations.create');

    const resolvedImageUrl = await storageService.resolveUploadedFile(formData, 'imageUrl', 'destinations');

    const rawData = {
      id: formData.get('id'),
      categoryId: formData.get('categoryId') || null,
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      imageUrl: resolvedImageUrl,
      state: formData.get('state') || null,
      city: formData.get('city') || null,
      country: formData.get('country') || 'Venezuela',
    };

    const parsed = createDestinationSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateDestinationCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createDestinationContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(destinationRoutes.list());
  revalidatePath('/');
  revalidatePath('/destinos');
  await setFlash('success', 'Destino turístico creado exitosamente.');
  redirect(destinationRoutes.list());
}

export async function updateDestinationAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let updatedSlug = '';
  try {
    await requirePermission('destinations.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de destino inválido.' };
    }

    const resolvedImageUrl = await storageService.resolveUploadedFile(formData, 'imageUrl', 'destinations');

    const rawData = {
      categoryId: formData.get('categoryId') || null,
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      imageUrl: resolvedImageUrl,
      state: formData.get('state') || null,
      city: formData.get('city') || null,
      country: formData.get('country') || 'Venezuela',
    };

    const parsed = updateDestinationSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateDestinationCommand.fromInput(parsed.data);
    updatedSlug = command.slug;

    await db.transaction(async (tx) => {
      const container = createDestinationContainer(tx);
      await container.updateService.execute(id, command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(destinationRoutes.list());
  revalidatePath(destinationRoutes.show(id));
  revalidatePath('/');
  revalidatePath('/destinos');
  revalidatePath(`/destinos/${id}`);
  if (updatedSlug) {
    revalidatePath(`/destinos/${updatedSlug}`);
  }
  await setFlash('success', 'Destino turístico actualizado exitosamente.');
  redirect(destinationRoutes.list());
}

export async function updateDestinationStatusAction(
  id: string,
  status: 'active' | 'inactive',
): Promise<ActionState> {
  try {
    await requirePermission('destinations.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de destino inválido.' };
    }

    const parsed = updateStatusDestinationSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    const command = UpdateStatusDestinationCommand.fromInput(parsed.data);
    const container = createDestinationContainer(db);
    await container.updateStatusService.execute(id, command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(destinationRoutes.list());
  revalidatePath(destinationRoutes.show(id));
  revalidatePath('/');
  revalidatePath('/destinos');
  revalidatePath(`/destinos/${id}`);
  await setFlash('success', `Destino ${status === 'active' ? 'activado' : 'desactivado'} correctamente.`);
  return { status: 'idle' };
}
